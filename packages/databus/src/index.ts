import { Subject, filter, Observable } from 'rxjs';

/**
 * Interface defining the structure of events flowing through the DataBus.
 */
export interface BusEvent<T = any> {
  channel: string;
  payload: T;
  timestamp: number;
}

/**
 * A central DataBus for inter-service and plugin communication.
 * Implemented as a Singleton over RxJS Subject.
 */
class DataBusService {
  private subject = new Subject<BusEvent>();

  /**
   * Publish a message to a specific channel.
   * @param channel The channel name (e.g., 'flights', 'ships')
   * @param payload The data payload
   */
  public publish<T>(channel: string, payload: T): void {
    const event: BusEvent<T> = { channel, payload, timestamp: Date.now() };
    this.subject.next(event);

    // If running in a Node.js process (collector) but not in the browser, forward it to the gateway.
    // We check for 'process' and avoid forwarding if we are in the browser.
    if (typeof process !== 'undefined' && process.env) {
      // Don't await to avoid blocking the event loop
      fetch('http://localhost:3001/internal/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, payload })
      }).catch(err => {
        // Silently fail if gateway is down, or log minimally
        // console.warn(`[DataBus] IPC forwarding failed for ${channel}:`, err.message);
      });
    }
  }

  /**
   * Subscribe to a specific channel.
   * @param channel The channel name to listen for
   * @returns An Observable of the strongly-typed payload
   */
  public subscribe<T>(channel: string): Observable<BusEvent<T>> {
    return this.subject.pipe(
      filter((event) => event.channel === channel)
    ) as Observable<BusEvent<T>>;
  }
}

export const DataBus = new DataBusService();
