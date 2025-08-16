declare module '@react-native-community/background-fetch' {
    interface BackgroundFetchConfig {
      minimumFetchInterval?: number;
      stopOnTerminate?: boolean;
      startOnBoot?: boolean;
    }
  
    interface BackgroundFetch {
      configure(config: BackgroundFetchConfig, onFetch: (taskId: string) => Promise<void>, onTimeout: (taskId: string) => void): Promise<void>;
      start(): Promise<void>;
      finish(taskId: string): void;
    }
  
    const BackgroundFetch: BackgroundFetch;
    export default BackgroundFetch;
  }