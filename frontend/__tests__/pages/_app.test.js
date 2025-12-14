// Test for _app
import { render } from '@testing-library/react';
import App from '../../pages/_app';

describe('App Component', () => {
  it('renders without crashing', () => {
    const Component = () => <div>Test</div>;
    render(<App Component={Component} pageProps={{}} />);
  });
});
