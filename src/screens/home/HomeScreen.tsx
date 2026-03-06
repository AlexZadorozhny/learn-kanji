import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, ActivityIndicator, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useKanjiStore } from '../../store/kanjiStore';
import KanjiCard from '../../components/kanji/KanjiCard';
import { HomeStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { kanjiData, loading, loadKanji } = useKanjiStore();

  useEffect(() => {
    loadKanji();
  }, []);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading kanji...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
          <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {kanjiData.length} characters available
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  subtitle: {
    // color set dynamically
  },
  listContent: {
    paddingVertical: 8,
  },
});
