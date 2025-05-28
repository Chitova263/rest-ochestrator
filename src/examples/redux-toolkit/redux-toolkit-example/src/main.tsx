import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { Provider } from 'react-redux';
import type { TaskConfiguration } from '../../../../core/contracts.ts';
import { orchestrator, store } from './store/store.ts';

(function bootstrap(): void {
    const config: TaskConfiguration<string> = {
        name: 'main',
        steps: [
            { name: 'init', dependsOn: ['main'] },
            { name: 'load', dependsOn: ['init'] },
            { name: 'report', dependsOn: ['load'] },
        ],
        dependsOn: [],
    };
    orchestrator.enqueue(config);
})();

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>
);
