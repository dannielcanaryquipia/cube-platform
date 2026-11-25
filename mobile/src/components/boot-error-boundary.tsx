import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { bootLog } from '@/lib/boot-log';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class BootErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    bootLog('render crash', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    });
    console.error('[lbl] render crash', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 8 }}>
          <Text>Launch failed</Text>
          <Text>Check the Metro terminal for [lbl] lines.</Text>
          <Text>{this.state.error.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
