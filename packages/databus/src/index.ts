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
    this.subject.next({
      channel,
      payload,
      timestamp: Date.now(),
    });
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
