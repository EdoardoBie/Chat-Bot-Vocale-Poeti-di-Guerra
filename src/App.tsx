/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import ChatInterface from './components/ChatInterface';

export default function App() {
  useEffect(() => {
    console.log("App mounted");
  }, []);

  return <ChatInterface />;
}
