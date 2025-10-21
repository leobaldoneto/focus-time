import { useAtom } from 'jotai';
import { Trash2 } from 'lucide-react';
import { historyLogAtom } from '../atoms/historyAtoms';

export const History = () => {
  const [historyLog, setHistoryLog] = useAtom(historyLogAtom);

  const deleteHistoryItem = (index) => {
    setHistoryLog((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="history-wrapper">
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Task</th>
            <th>Start</th>
            <th>Duration</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {historyLog.map((item, idx) => (
            <tr key={idx}>
              <td>{item.type}</td>
              <td>{item.task || '-'}</td>
              <td>{item.startTime}</td>
              <td>{item.duration}</td>
              <td>
                <button onClick={() => deleteHistoryItem(idx)} className="icon-btn contrast">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
