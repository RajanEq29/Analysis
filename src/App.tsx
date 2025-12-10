import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { Dashboard } from './components/Dashboard';

function App() {
  return (
    <MantineProvider>
      <Dashboard />
    </MantineProvider>
  );
}

export default App;
