import { useAtom } from 'jotai';
import { taskInputAtom } from '../atoms/timerAtoms';

export const TaskInput = () => {
  const [taskInput, setTaskInput] = useAtom(taskInputAtom);

  return (
    <input
      id="task-input"
      value={taskInput}
      onChange={(e) => setTaskInput(e.target.value)}
      type="text"
      placeholder="What are you working on?"
      className="task-input"
    />
  );
};
