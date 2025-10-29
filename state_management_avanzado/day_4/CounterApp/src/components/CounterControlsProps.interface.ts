export type CounterControlsProps = {
    onReset: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
    onIncrementByAmount?: (amount: number) => void;
};