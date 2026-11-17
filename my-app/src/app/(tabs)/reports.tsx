import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Colors, Typography, Spacing, BorderRadius, getRiskColors } from '../../constants/theme';
import { RiskBadge } from '../../components/ui/RiskBadge';

type Filter = 'ALL' | 'LOW' | 'CAUTION' | 'HIGH' | 'CRITICAL';

const FILTERS: Filter[] = ['ALL', 'LOW', 'CAUTION', 'HIGH', 'CRITICAL'];

export default function ReportsScreen() {
  const router = useRouter();
  const { reports, deleteReport, clearReports } = useApp();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let r = reports;
    if (filter !== 'ALL') r = r.filter((x) => x.riskLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.category.toLowerCase().includes(q) ||
          x.content.toLowerCase().includes(q) ||
          x.summary.toLowerCase().includes(q),
      );
    }
    return r;
  }, [reports, filter, search]);

  const handleClearAll = () => {
    if (reports.length === 0) return;
    Alert.alert(
      'Clear All Reports',
      'This will permanently delete all your detection history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearReports() },
      ],
    );
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Report', 'Remove this report from your history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteReport(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          <Text style={styles.headerSub}>
            {reports.length} detection{reports.length !== 1 ? 's' : ''} total
          </Text>
        </View>
        {reports.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.highRisk} />
            <Text style={styles.clearBtnText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <FlatList
        data={FILTERS}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
        renderItem={({ item: f }) => {
          const active = filter === f;
          const color = f === 'ALL' ? Colors.primary : getRiskColors(f).accent;
          const count = f !== 'ALL' ? reports.filter((r) => r.riskLevel === f).length : reports.length;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                active && { backgroundColor: color + '22', borderColor: color },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, { color: active ? color : Colors.textMuted }]}>
                {f} ({count})
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {reports.length === 0 ? 'No reports yet' : 'No matching reports'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {reports.length === 0
              ? 'Analyse a message, link, or QR code to see results here.'
              : 'Try a different filter or search term.'}
          </Text>
          {reports.length === 0 && (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={() => router.push('/analysis/message' as any)}
            >
              <Text style={styles.startBtnText}>Analyse a Message</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const c = getRiskColors(item.riskLevel);
            return (
              <TouchableOpacity
                style={styles.reportCard}
                onPress={() =>
                  router.push({ pathname: '/analysis/result', params: { reportId: item.id } })
                }
                onLongPress={() => handleDelete(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.typeIcon, { backgroundColor: c.accent + '22' }]}>
                  <Ionicons
                    name={
                      item.type === 'message'
                        ? 'chatbubble-outline'
                        : item.type === 'url'
                        ? 'link'
                        : 'qr-code-outline'
                    }
                    size={20}
                    color={c.accent}
                  />
                </View>
                <View style={styles.reportInfo}>
                  <View style={styles.reportTopRow}>
                    <Text style={styles.reportCategory} numberOfLines={1}>{item.category}</Text>
                    <RiskBadge riskLevel={item.riskLevel} />
                  </View>
                  <Text style={styles.reportPreview} numberOfLines={2}>{item.content}</Text>
                  <View style={styles.reportMeta}>
                    <Text style={styles.reportDate}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                    {item.saved && (
                      <Ionicons name="bookmark" size={12} color={Colors.primary} />
                    )}
                    <View style={styles.methodTag}>
                      <Text style={styles.methodTagText}>
                        {item.analysisMethod === 'ai' ? 'AI' : 'Rules'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.lg,
  },
  headerTitle: { fontSize: Typography.fontSizes['2xl'], fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  clearBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.highRisk + '11',
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.highRisk + '44',
  },
  clearBtnText: { fontSize: Typography.fontSizes.sm, color: Colors.highRisk, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.md, gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  filtersRow: { maxHeight: 48, marginBottom: Spacing.md },
  filtersContent: { paddingHorizontal: Spacing.base, gap: 8 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
  },
  filterText: { fontSize: Typography.fontSizes.sm, fontWeight: '600' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 24 },
  reportCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.surfaceBorder,
    marginBottom: Spacing.sm, gap: 12,
  },
  typeIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reportCategory: { fontSize: Typography.fontSizes.sm, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 8 },
  reportPreview: { fontSize: Typography.fontSizes.xs, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reportDate: { fontSize: Typography.fontSizes.xs, color: Colors.textMuted, flex: 1 },
  methodTag: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  methodTagText: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing['2xl'] },
  emptyTitle: { fontSize: Typography.fontSizes.xl, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.base },
  emptySubtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.sm, lineHeight: 20 },
  startBtn: { marginTop: Spacing.xl, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: BorderRadius.lg },
  startBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.fontSizes.base },
});

