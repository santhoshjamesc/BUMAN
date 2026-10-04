import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AnimatedText } from '../components/AnimatedText';
import { FadeSwitch } from '../components/FadeSwitch';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { Gender, UserProfile } from '../storage/types';
import { colors, typography, useScale } from '../theme';

const GENDERS: readonly Gender[] = ['Woman', 'Man', 'Non-binary', 'Prefer not to say'];
const MIN_AGE = 13;
const MAX_AGE = 120;

type Step = 'name' | 'age' | 'gender';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const finished = useRef(false);

  const trimmedName = name.trim();
  const ageNumber = Number(age);
  const ageValid = Number.isInteger(ageNumber) && ageNumber >= MIN_AGE && ageNumber <= MAX_AGE;

  const finish = (selected: Gender) => {
    if (finished.current) return;
    finished.current = true;
    onComplete({ name: trimmedName, age: ageNumber, gender: selected });
  };

  return (
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FadeSwitch transitionKey={step}>
        {step === 'name' && (
          <QuestionStep
            label="FIRST"
            question="What should we call you?"
            canContinue={trimmedName.length > 0}
            onContinue={() => setStep('age')}
          >
            <Field
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              maxLength={32}
              onSubmit={() => trimmedName && setStep('age')}
            />
          </QuestionStep>
        )}

        {step === 'age' && (
          <QuestionStep
            label="SECOND"
            question={`How old are you, ${trimmedName}?`}
            canContinue={ageValid}
            onContinue={() => setStep('gender')}
          >
            <Field
              value={age}
              onChangeText={(text) => setAge(text.replace(/[^0-9]/g, ''))}
              placeholder="Your age"
              keyboardType="number-pad"
              maxLength={3}
              onSubmit={() => ageValid && setStep('gender')}
            />
            {age.length > 0 && !ageValid ? (
              <AnimatedText variant="body" muted wiggle={false} style={styles.hint}>
                {`Please enter an age between ${MIN_AGE} and ${MAX_AGE}.`}
              </AnimatedText>
            ) : null}
          </QuestionStep>
        )}

        {step === 'gender' && (
          <QuestionStep
            label="LAST"
            question="How do you identify?"
            canContinue={gender !== null}
            onContinue={() => gender && finish(gender)}
            buttonLabel="BEGIN"
          >
            <View style={styles.options}>
              {GENDERS.map((option, index) => (
                <Option
                  key={option}
                  label={option}
                  selected={gender === option}
                  delay={500 + index * 120}
                  onPress={() => setGender(option)}
                />
              ))}
            </View>
          </QuestionStep>
        )}
      </FadeSwitch>
    </KeyboardAvoidingView>
  );
}

interface QuestionStepProps {
  label: string;
  question: string;
  canContinue: boolean;
  onContinue: () => void;
  buttonLabel?: string;
  children: React.ReactNode;
}

function QuestionStep({
  label,
  question,
  canContinue,
  onContinue,
  buttonLabel = 'CONTINUE',
  children,
}: QuestionStepProps) {
  return (
    <Screen
      footer={
        <PrimaryButton
          label={buttonLabel}
          onPress={onContinue}
          disabled={!canContinue}
          delay={700}
        />
      }
    >
      <AnimatedText variant="label" muted wiggle={false}>
        {label}
      </AnimatedText>
      <AnimatedText variant="title" delay={150} style={styles.question}>
        {question}
      </AnimatedText>
      {children}
    </Screen>
  );
}

interface FieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: () => void;
  keyboardType?: 'default' | 'number-pad';
  autoCapitalize?: 'none' | 'words';
  maxLength?: number;
}

function Field({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
}: FieldProps) {
  const { s } = useScale();
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
      autoFocus
      maxLength={maxLength}
      returnKeyType="done"
      onSubmitEditing={onSubmit}
      selectionColor={colors.text}
      keyboardAppearance="dark"
      style={[
        styles.input,
        { fontSize: s(typography.title.fontSize), paddingVertical: s(12) },
      ]}
    />
  );
}

interface OptionProps {
  label: string;
  selected: boolean;
  delay: number;
  onPress: () => void;
}

function Option({ label, selected, delay, onPress }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={8}
      style={styles.option}
    >
      <AnimatedText
        variant="title"
        delay={delay}
        wiggle={selected}
        style={{ color: selected ? colors.text : colors.textFaint }}
      >
        {label}
      </AnimatedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background },
  question: { marginTop: 16, marginBottom: 32 },
  input: {
    color: colors.text,
    fontWeight: '300',
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: colors.hairline,
  },
  hint: { marginTop: 16 },
  options: { gap: 6 },
  option: { paddingVertical: 8 },
});
