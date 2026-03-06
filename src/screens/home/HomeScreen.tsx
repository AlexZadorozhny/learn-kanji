import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKanjiStore } from '../../store/kanjiStore';
import { useProgressStore } from '../../store/progressStore';
import KanjiCard from '../../components/kanji/KanjiCard';
import { HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { kanjiData, loading, loadKanji } = useKanjiStore();
  const { studyStats, updateStudyStats } = useProgressStore();

  useEffect(() => {
    loadKanji();
  }, []);

  const handleTestPersistence = () => {
    // Increment study stats to test persistence
    updateStudyStats({
      totalKanjiStudied: studyStats.totalKanjiStudied + 1,
      totalStudyTimeMinutes: studyStats.totalStudyTimeMinutes + 5,
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading kanji...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={kanjiData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <KanjiCard
            kanji={item}
            onPress={() => navigation.navigate('KanjiDetail', { kanjiId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.header}>
            <Text variant="bodyMedium" style={styles.subtitle}>
              {kanjiData.length} characters available
            </Text>
            <Button
              mode="outlined"
              onPress={handleTestPersistence}
              style={styles.testButton}
              icon="test-tube"
            >
              Test Storage (+1 study)
            </Button>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  testButton: {
    marginTop: 4,
  },
  listContent: {
    paddingVertical: 8,
  },
});
