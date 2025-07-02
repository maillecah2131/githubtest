import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
  ScrollView,
  Image,



} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContextScreen';
import API_URL from '../config';

const AccountScreen = ({ navigation }) => {
  const { setUserId } = useUser();
  const [formData, setFormData] = useState({
    userName: '',
    mail: '',
    password: '',
    confirmPassword: '',
  });





  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.bezier(0.28, 0, 0.63, 1),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'Username is required';
    }

    if (!formData.mail.trim()) {
      newErrors.mail = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.mail)) {
      newErrors.mail = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        console.log('Sending signup request:', {
          username: formData.userName,
          email: formData.mail,
        });
        const response = await axios.post(`${API_URL}/api/auth/register`, {
          username: formData.userName,
          email: formData.mail,
          password: formData.password,
        });

        console.log('Signup response:', response.data);
   console.log('missou is the best ', response.data);
        if (response.data.success) {
          const userId = response.data.data.userId;

          // Save to AsyncStorage
          await AsyncStorage.setItem('userId', userId);

          // Save to global context
          setUserId(userId);

          setSuccess(response.data.message);
          setErrors({});
          console.log('Signup successful, navigating to GenderScreen');
          navigation.navigate('Gender'); // Direct navigation
        } else {
          setSuccess('');
          setErrors({ general: response.data.message || 'Registration failed' });
          Alert.alert('Error', response.data.message || 'Registration failed');
        }
      } catch (err) {
        console.error('Signup error:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Something went wrong';
        setErrors({ general: errorMessage });
        Alert.alert('Error', errorMessage);
      }
    }
  };

  const slideUp = {
    transform: [
      {
        translateY: slideAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
    opacity: slideAnim,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Choice')}
        >
          <Ionicons name="arrow-back" size={28} color="#1C204D" />
        </TouchableOpacity>

        <Image
          source={require('../assets/logo2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Animated.View style={[styles.formContainer, slideUp]}>
        <View style={styles.topLine} />
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
        >
          {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
          {success && <Text style={styles.successText}>{success}</Text>}

          <Text style={styles.label}>Username*</Text>
          <TextInput
            style={[styles.input, errors.userName && styles.errorInput]}
            placeholder="Enter your username"
            value={formData.userName}
            onChangeText={(text) => handleInputChange('userName', text)}
          />
          {errors.userName && <Text style={styles.errorText}>{errors.userName}</Text>}

          <Text style={styles.label}>Email*</Text>
          <TextInput
            style={[styles.input, errors.mail && styles.errorInput]}
            placeholder="Enter your email"
            value={formData.mail}
            onChangeText={(text) => handleInputChange('mail', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.mail && <Text style={styles.errorText}>{errors.mail}</Text>}

          <Text style={styles.label}>Password*</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.password && styles.errorInput]}
              placeholder="Enter your password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowPassword}>
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <Text style={styles.label}>Confirm Password*</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, errors.confirmPassword && styles.errorInput]}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleShowConfirmPassword}>
              <MaterialIcons
                name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}

          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 70,
    zIndex: 1,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 2,
    borderColor: 'black',
    paddingHorizontal: 25,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    marginTop: -10,
  },
  topLine: {
    width: 50,
    height: 4,
    backgroundColor: 'black',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: -10,
    marginBottom: 10,
  },
  formContent: {
    paddingBottom: 50,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
    backgroundColor: 'white',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: 'white',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  errorInput: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 15,
  },
  successText: {
    color: 'green',
    fontSize: 12,
    marginBottom: 15,
  },
  signUpButton: {
    backgroundColor: '#1C204D',
    borderRadius: 25,
    paddingVertical: 15,
    marginTop: 20,
  },
  signUpButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AccountScreen;
