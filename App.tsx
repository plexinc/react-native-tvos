import React from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

// All layout values are authored for a 1920-wide screen (1:1).
// On 4K (3840-wide) we scale 2×, on 960-wide (Android TV dp) we scale 0.5×, etc.
const scale = Dimensions.get('window').width / 1920;
const px = (v: number) => v * scale;

// Overlay chrome dimensions — mimicking an edge-to-edge app (e.g. Plex TV)
// where the nav/tab bars sit on top of an underlying scroll surface.
const NAV_BAR_HEIGHT = px(110);
const TAB_BAR_HEIGHT = px(90);
const SIDE_RAIL_WIDTH = px(120);

const COLORS = [
  '#E74C3C',
  '#3498DB',
  '#2ECC71',
  '#F39C12',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
  '#2980B9',
  '#27AE60',
  '#C0392B',
];

const Card = ({
  label,
  width = 300,
  height = 180,
  colorIndex = 0,
}: {
  label: string;
  width?: number;
  height?: number;
  colorIndex?: number;
}) => {
  return (
    <Pressable
      style={({ focused }) => [
        {
          borderRadius: px(12),
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          borderWidth: px(3),
          borderColor: 'transparent',
          width: px(width),
          height: px(height),
          backgroundColor: COLORS[colorIndex % COLORS.length],
        },
        focused && { borderColor: '#ffffff' },
      ]}
    >
      {({ focused }) => (
        <Text
          style={[
            { fontSize: px(22), fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
            focused && { color: '#ffffff' },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const SectionHeader = ({ title }: { title: string }) => (
  <View style={{ marginBottom: px(16) }}>
    <Text style={{ fontSize: px(28), fontWeight: '600', color: '#e0e0e0' }}>{title}</Text>
  </View>
);

// Horizontal ScrollView whose own paddingLeft/paddingRight push content under
// the side rails — exposes the snap-vs-padding bug on the horizontal axis for
// every alignment.
const PaddedHorizontalExample = ({ align }: { align: 'start' | 'center' | 'end' }) => (
  <View>
    <SectionHeader title={`Horizontal — snapAlign: ${align} (padded)`} />
    <ScrollView
      horizontal
      scrollSnapType="mandatory"
      showsHorizontalScrollIndicator={false}
      style={{
        paddingLeft: SIDE_RAIL_WIDTH,
        paddingRight: SIDE_RAIL_WIDTH,
      }}
    >
      {Array.from({ length: 15 }, (_, i) => (
        <View key={i} scrollSnapAlign={align} style={{ marginRight: px(20) }}>
          <Card label={`Item ${i + 1}`} width={280} height={160} colorIndex={i} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const ScrollPaddingExample = () => (
  <View>
    <SectionHeader title="Horizontal — snapAlign: start, scrollPadding: 60" />
    <ScrollView
      horizontal
      scrollSnapType="mandatory"
      scrollPadding={px(60)}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: px(4) }}
    >
      {Array.from({ length: 15 }, (_, i) => (
        <View key={i} scrollSnapAlign="start" style={{ marginRight: px(20) }}>
          <Card label={`Item ${i + 1}`} width={280} height={160} colorIndex={i} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const VerticalExample = ({ align }: { align: 'start' | 'center' | 'end' }) => (
  <View>
    <SectionHeader title={`Vertical — snapAlign: ${align}`} />
    <ScrollView
      scrollSnapType="mandatory"
      showsVerticalScrollIndicator={false}
      style={{ height: px(500) }}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <View key={i} scrollSnapAlign={align} style={{ marginBottom: px(16) }}>
          <Card label={`Row ${i + 1}`} width={600} height={120} colorIndex={i + 5} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const NestedExample = () => (
  <View>
    <SectionHeader title="Nested — Vertical + Horizontal" />
    <ScrollView
      scrollSnapType="mandatory"
      showsVerticalScrollIndicator={false}
      style={{ height: px(500) }}
      contentContainerStyle={{ gap: px(40) }}
    >
      <View scrollSnapAlign="start">
        <PaddedHorizontalExample align={'start'} />
      </View>
      <View scrollSnapAlign="start">
        <PaddedHorizontalExample align={'center'} />
      </View>
    </ScrollView>
  </View>
);

// Translucent overlay nav bar — sits on top of the outer ScrollView. The
// outer ScrollView has paddingTop equal to NAV_BAR_HEIGHT so content scrolls
// underneath. When the snap-on-focus bug is present, focusing an item at the
// top of the list lands it behind this bar.
const TopNavBar = () => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: NAV_BAR_HEIGHT,
      backgroundColor: 'rgba(10, 10, 25, 0.85)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: px(40),
      gap: px(40),
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
      zIndex: 10,
    }}
  >
    <Text style={{ fontSize: px(26), fontWeight: '700', color: '#fff' }}>
      Scroll Snap Demo
    </Text>
    {['Home', 'First Tab', 'Second Tab', 'Third Tab', 'Fourth Tab'].map((label) => (
      <Text key={label} style={{ fontSize: px(22), color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </Text>
    ))}
  </View>
);

// Bottom tab bar overlay — exposes the bug on the `end` anchor.
const BottomTabBar = () => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: TAB_BAR_HEIGHT,
      backgroundColor: 'rgba(10, 10, 25, 0.85)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingHorizontal: px(40),
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
      zIndex: 10,
    }}
  >
    {['First Button', 'Second Button', 'Third Button', 'Fourth Button'].map((label) => (
      <Text key={label} style={{ fontSize: px(22), color: 'rgba(255,255,255,0.7)' }}>
        {label}
      </Text>
    ))}
  </View>
);

const App = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <ScrollView
        scrollSnapType="mandatory"
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          paddingTop: NAV_BAR_HEIGHT,
          paddingBottom: TAB_BAR_HEIGHT,
          paddingHorizontal: px(40),
        }}
        contentContainerStyle={{ gap: px(40), paddingBottom: px(40) }}
      >
        <View scrollSnapAlign="center" style={{ flexDirection: 'row', gap: px(16) }}>
          <VerticalExample align={'start'} />
          <VerticalExample align={'center'} />
          <VerticalExample align={'end'} />
        </View>
        <View scrollSnapAlign="start">
          <PaddedHorizontalExample align={'start'} />
        </View>
        <View scrollSnapAlign="center">
          <PaddedHorizontalExample align={'center'} />
        </View>
        <View scrollSnapAlign="end">
          <PaddedHorizontalExample align={'end'} />
        </View>
        <View scrollSnapAlign="center">
          <ScrollPaddingExample />
        </View>
        <View scrollSnapAlign="center">
          <NestedExample />
        </View>
      </ScrollView>
      <TopNavBar />
      <BottomTabBar />
    </View>
  );
};

export default App;
