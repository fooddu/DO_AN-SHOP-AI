import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const AuthOtpInput = ({ value, onChange, length = 6 }) => {
  const code = value.split('').concat(Array(length).fill('')).slice(0, length);

  const inputs = Array(length).fill(0);

  const refs = React.useRef([]);

  const handleChange = (text, idx) => {
    let ch = text.replace(/[^0-9]/g, '').slice(0, 1);
    let newValue = code.slice();
    newValue[idx] = ch;
    const joined = newValue.join('').slice(0, length);
    onChange && onChange(joined);
    if (ch && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
    if (!ch && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpContainer}>
      {inputs.map((_, idx) => (
        <TextInput
          key={idx}
          style={styles.otpInput}
          keyboardType="numeric"
          maxLength={1}
          value={code[idx]}
          onChangeText={(text) => handleChange(text, idx)}
          ref={ref => refs.current[idx] = ref}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    textAlign: 'center',
    fontSize: 28,
    color: '#333',
    marginHorizontal: 4,
    backgroundColor: '#fafafd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default AuthOtpInput;
