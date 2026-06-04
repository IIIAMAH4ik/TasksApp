import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'error'>('info');
  const [isLoading, setIsLoading] = useState(false);

  function showMessage(
    text: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) {
    setMessage(text);
    setMessageType(type);
  }

  async function handleSignIn() {
    if (!email.trim() || !password) {
     showMessage('Укажи email и пароль.', 'error');
     return;
     }

    try {
       setIsLoading(true);
     showMessage('Выполняю вход...', 'info');

      const result = await signIn(email.trim(), password);

     console.log('login screen sign in result:', result);

     if (result.error) {
       showMessage(result.error, 'error');
       return;
        }

       showMessage('Вход выполнен.', 'success');
    } catch (error) {
      console.log('login screen sign in error:', error);
      showMessage('Ошибка входа. Попробуйте ещё раз.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  function getAuthErrorMessage(message: string) {
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('email rate limit')) {
      return 'Слишком много писем отправлено на этот email. Подождите несколько минут и попробуйте снова.';
    }

    if (normalizedMessage.includes('invalid login credentials')) {
      return 'Неверный email или пароль.';
    }

    if (normalizedMessage.includes('email not confirmed')) {
      return 'Email ещё не подтверждён. Проверьте почту или попробуйте позже.';
    }

    if (normalizedMessage.includes('user already registered')) {
      return 'Пользователь с таким email уже зарегистрирован. Попробуйте войти.';
    }

    if (normalizedMessage.includes('password')) {
      return 'Пароль должен быть не короче 6 символов.';
    }

    if (normalizedMessage.includes('email')) {
      return 'Проверьте правильность email.';
    }

    return 'Ошибка авторизации. Попробуйте ещё раз.';
  }

  async function handleSignUp() {
     if (!email.trim() || !password) {
     showMessage('Укажи email и пароль.', 'error');
     return;
    }

     if (password.length < 6) {
      showMessage('Пароль должен быть минимум 6 символов.', 'error');
        return;
    }

    
     try {
      setIsLoading(true);
     showMessage('Создаю аккаунт...', 'info');

     const result = await signUp(email.trim(), password);

     console.log('login screen sign up result:', result);

      if (result.error) {
         showMessage(result.error, 'error');
       return;
      }

      showMessage(
        'Аккаунт создан. Подтверди email по ссылке из письма, затем вернись сюда и нажми "Войти".',
        'success'
      );
    } catch (error) {
      console.log('login screen sign up error:', error);
      showMessage('Ошибка регистрации. Попробуйте ещё раз.', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>Войди, чтобы сохранить прогресс.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#6d6963"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Пароль</Text>
        <TextInput
          style={styles.input}
          placeholder="Минимум 6 символов"
          placeholderTextColor="#6d6963"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Войти</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            <Text style={styles.secondaryButtonText}>Регистрация</Text>
          </Pressable>
        </View>

        <View style={styles.messageBox}>
          {isLoading && <ActivityIndicator />}
          {!!message && (
            <Text
              style={[
                styles.message,
                messageType === 'error' && styles.errorMessage,
                messageType === 'success' && styles.successMessage,
                messageType === 'info' && styles.infoMessage,
              ]}
            >
              {message}
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f11',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: '#18181c',
    borderColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
  },
  errorMessage: {
    color: '#e06e6e',
  },
  successMessage: {
    color: '#6dbf8e',
  },
  infoMessage: {
    color: '#aaa6a0',
  },
  title: {
    color: '#f6f2ec',
    fontSize: 34,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6d6963',
    fontSize: 13,
    marginBottom: 20,
  },
  label: {
    color: '#6d6963',
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#1f1f25',
    borderColor: 'rgba(255,255,255,0.09)',
    borderWidth: 1,
    borderRadius: 10,
    color: '#f6f2ec',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#b8a98a',
  },
  secondaryButton: {
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
  },
  primaryButtonText: {
    color: '#0f0f11',
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#aaa6a0',
    fontWeight: '600',
  },
  messageBox: {
    minHeight: 42,
    marginTop: 14,
    gap: 8,
  },
  message: {
    color: '#aaa6a0',
    fontSize: 13,
    lineHeight: 18,
  },
});