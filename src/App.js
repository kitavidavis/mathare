import { MantineProvider, Text } from '@mantine/core';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Form from './Questionnare';
import ExecutiveDashboard from './top-executives/Dashboard';

function App() {
  return (
    <MantineProvider theme={{colorScheme: 'dark', primaryColor: "cyan", primaryShade: 6}} withGlobalStyles withNormalizeCSS>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<ExecutiveDashboard />} />
        <Route path='/form' element={<Form />} />
      </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
