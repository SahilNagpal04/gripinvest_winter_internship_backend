import { useRouter } from 'next/router';

export default function PortfolioHealthScore({ healthScore, compact = false }) {
  const router = useRouter();
  if (!healthScore || healthScore.score === 0 || !healthScore.breakdown) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 dark:text-gray-100">📊 Portfolio Health Score</h3>
        <p className="text-gray-600 dark:text-gray-400">Start investing to see your portfolio health score</p>
      </div>
    );
  }

  const { score, status, breakdown, tips } = healthScore;
  const color = score > 80 ? 'green' : score > 60 ? 'green' : score > 40 ? 'yellow' : 'red';
  const emoji = score > 80 ? '🟢' : score > 60 ? '🟢' : score > 40 ? '🟡' : '🔴';

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/portfolio')}>
        <h3 className="text-lg font-bold mb-4 dark:text-gray-100">📊 Portfolio Health Score</h3>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl font-bold text-${color}-600`}>{score}</div>
            <div className="text-gray-600 dark:text-gray-400 mt-2">{status}</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl">{emoji}</span>
          <span className="ml-2 text-gray-700 dark:text-gray-300">
            {score > 60 ? 'Your portfolio is in good health!' : 'Room for improvement'}
          </span>
        </div>
        <div className="mt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
          Click to view details →
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold mb-4 dark:text-gray-100">📊 Portfolio Health Score</h3>
      
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <div className={`text-6xl font-bold text-${color}-600`}>{score}</div>
          <div className="text-gray-600 dark:text-gray-400 mt-2">{status}</div>
        </div>
      </div>

      <div className="text-center mb-6">
        <span className="text-2xl">{emoji}</span>
        <span className="ml-2 text-gray-700 dark:text-gray-300">
          {score > 60 ? 'Your portfolio is in good health!' : 'Room for improvement'}
        </span>
      </div>

      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 dark:text-gray-100">Score Breakdown:</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="dark:text-gray-300">Diversification</span>
                <span className="dark:text-gray-300">{breakdown.diversification || 0}/30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${((breakdown.diversification || 0)/30)*100}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="dark:text-gray-300">Risk Balance</span>
                <span className="dark:text-gray-300">{breakdown.riskBalance || 0}/30</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${((breakdown.riskBalance || 0)/30)*100}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="dark:text-gray-300">Returns Performance</span>
                <span className="dark:text-gray-300">{breakdown.returns || 0}/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${((breakdown.returns || 0)/20)*100}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="dark:text-gray-300">Active Investments</span>
                <span className="dark:text-gray-300">{breakdown.activeInvestments || 0}/20</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: `${((breakdown.activeInvestments || 0)/20)*100}%`}}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tips.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h4 className="font-semibold mb-2 dark:text-gray-100">💡 Tips to Improve:</h4>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            {tips.map((tip, idx) => (
              <li key={idx}>• {tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
