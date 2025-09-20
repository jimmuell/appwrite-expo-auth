import React from 'react'
import { Text, TextInput, TextInputProps, View } from 'react-native'

type Props = TextInputProps & { label: string }

export default function TextInputField({ label, style, ...rest }: Props) {
  return (
    <View style={{ width: '100%', marginBottom: 12 }}>
      <Text style={{ marginBottom: 6, fontWeight: '600' }}>{label}</Text>
      <TextInput
        style={[
          {
            height: 44,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 12
          },
          style
        ]}
        {...rest}
      />
    </View>
  )
}
