import DataLoader from 'dataloader';

export function createInstrumentedDataLoader<K, V>(
    batchLoadFn: DataLoader.BatchLoadFn<K, V>,
    name: string
): DataLoader<K, V> {
    return new DataLoader(batchLoadFn, {
        cache: true,
        batchScheduleFn: callback => {
            console.log(`DataLoader ${name}: Scheduling batch`);
            setImmediate(callback);
        }
    });
};