import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

export default function TimePicker({ value, onChange, onClose }: any) {
  return (
    <DateTimePicker
      value={value}
      mode="time"
      is24Hour={true}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={(event, date) => {
        onClose();
        if (date) onChange(date);
      }}
    />
  );
} 