import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  ScrollView, 
  Animated, 
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useOnboarding } from '../../context/OnboardingContext';
import { getZodiacSign } from '../../utils/zodiac';
import { zodiacData } from '../../constants/zodiacData';
import { readers, Reader } from '../../constants/readers';
import { triggerLight, triggerMedium, triggerSuccess } from '../../utils/haptics';
import CelestialBackground from '../../components/CelestialBackground';
import { Heart, Star, MessageSquare } from 'lucide-react-native';

const FILTER_OPTIONS = ["All guides", "Favorites", "Available now", "Love", "Clarity", "Moon"];

const cardWidth = (Dimensions.get('window').width - 52) / 2; // 2-columns with margins and gaps

export default function ReadersScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  // State
  const [selectedFilter, setSelectedFilter] = useState("All guides");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Availability Dot Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Staggered Cards Reveal Anims
  const cardOpacityAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  const cardYAnims = useRef(Array.from({ length: 6 }, () => new Animated.Value(15))).current;

  // Card Press Scale Animation Refs
  const cardPressScales = useRef(readers.reduce((acc, r) => {
    acc[r.id] = new Animated.Value(1);
    return acc;
  }, {} as Record<number, Animated.Value>)).current;

  // Resolve user zodiac sign context
  const resolvedSign = useMemo(() => {
    if (onboardingData.zodiacSign && zodiacData[onboardingData.zodiacSign]) {
      return zodiacData[onboardingData.zodiacSign];
    }
    if (onboardingData.dob) {
      return getZodiacSign(onboardingData.dob);
    }
    return zodiacData["Aquarius"];
  }, [onboardingData.zodiacSign, onboardingData.dob]);

  // Handle availability pulsing loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Filter guides list
  const filteredReaders = useMemo(() => {
    let list = readers;
    
    if (selectedFilter === "Favorites") {
      return list.filter(r => favorites.includes(r.id));
    }
    if (selectedFilter === "Available now") {
      return list.filter(r => r.available === "now");
    }
    if (selectedFilter === "Love") {
      return list.filter(r => r.tags.includes("Love") || r.tags.includes("Relationships"));
    }
    if (selectedFilter === "Clarity") {
      return list.filter(r => r.tags.includes("Clarity") || r.tags.includes("Energy"));
    }
    if (selectedFilter === "Moon") {
      return list.filter(r => r.tags.includes("Moon"));
    }
    
    return list; // All guides
  }, [selectedFilter, favorites]);

  // Trigger stagger animation whenever filter list changes
  useEffect(() => {
    cardOpacityAnims.forEach(anim => anim.setValue(0));
    cardYAnims.forEach(anim => anim.setValue(15));

    const anims = filteredReaders.map((_, index) => {
      if (index >= 6) return null;
      return Animated.parallel([
        Animated.timing(cardOpacityAnims[index], {
          toValue: 1,
          duration: 350,
          useNativeDriver: true
        }),
        Animated.timing(cardYAnims[index], {
          toValue: 0,
          duration: 350,
          useNativeDriver: true
        })
      ]);
    }).filter((a): a is Animated.CompositeAnimation => a !== null);

    Animated.stagger(60, anims).start();
  }, [filteredReaders]);

  const handleRequestCall = (readerId: number) => {
    triggerSuccess();
    router.push({
      pathname: '/call',
      params: { id: readerId.toString(), readerId: readerId.toString() }
    });
  };

  const toggleFavorite = (readerId: number) => {
    triggerMedium();
    setFavorites(prev => {
      if (prev.includes(readerId)) {
        return prev.filter(id => id !== readerId);
      } else {
        return [...prev, readerId];
      }
    });
  };

  // Card scale press responses
  const handleCardPressIn = (readerId: number) => {
    triggerLight();
    Animated.spring(cardPressScales[readerId], {
      toValue: 0.98,
      useNativeDriver: true
    }).start();
  };

  const handleCardPressOut = (readerId: number) => {
    Animated.spring(cardPressScales[readerId], {
      toValue: 1.0,
      useNativeDriver: true
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="low" showConstellation={false} intensity={0.3} />

      {/* Top Header Navigation */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.titleText}>Spiritual Guides</Text>
          <Text style={styles.subtitleText}>Private voice calls with trusted readers</Text>
        </View>

        {/* Top-right Actions */}
        <View style={styles.headerActions}>
          <Pressable style={styles.messageIconBtn} onPress={triggerLight}>
            <MessageSquare size={18} color="#8A8A8A" />
          </Pressable>
          <View style={styles.balancePill}>
            <Text style={styles.balanceText}>Trial</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Horizontal Filter Chips Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
            {FILTER_OPTIONS.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => {
                    triggerLight();
                    setSelectedFilter(filter);
                  }}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Guides 2-Column Grid */}
        {filteredReaders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No guides are available for this filter.
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredReaders.map((reader, index) => {
              const isFav = favorites.includes(reader.id);
              const isNow = reader.available === 'now';
              
              // Map animations to indices dynamically (0 to 5) safely
              const opacityVal = cardOpacityAnims[index] || new Animated.Value(1);
              const translateYVal = cardYAnims[index] || new Animated.Value(0);
              const cardScaleVal = cardPressScales[reader.id] || new Animated.Value(1);

              return (
                <Animated.View
                  key={reader.id}
                  style={[
                    styles.cardWrapper,
                    {
                      opacity: opacityVal,
                      transform: [
                        { translateY: translateYVal },
                        { scale: cardScaleVal }
                      ]
                    }
                  ]}
                >
                  <Pressable
                    onPressIn={() => handleCardPressIn(reader.id)}
                    onPressOut={() => handleCardPressOut(reader.id)}
                    onPress={() => handleRequestCall(reader.id)}
                    style={styles.card}
                  >
                    {/* Thumbnail Image Container */}
                    <View style={styles.imageContainer}>
                      <Image 
                        source={{ uri: reader.image }} 
                        style={styles.thumbnail} 
                        contentFit="cover"
                        transition={200}
                      />
                      
                      {/* Favorite Overlay */}
                      <Pressable 
                        style={styles.favoriteBtn} 
                        onPress={() => toggleFavorite(reader.id)}
                        hitSlop={8}
                      >
                        <Heart 
                          size={14} 
                          color={isFav ? '#FF4A4A' : '#FFFFFF'} 
                          fill={isFav ? '#FF4A4A' : 'transparent'} 
                        />
                      </Pressable>

                      {/* Availability Overlay Badge */}
                      <View style={styles.availabilityBadge}>
                        <Animated.View 
                          style={[
                            styles.pulseDot, 
                            isNow ? styles.pulseDotActive : styles.pulseDotInactive,
                            isNow && { opacity: pulseAnim }
                          ]} 
                        />
                        <Text style={styles.availabilityText}>
                          {isNow ? 'Now' : 'Today'}
                        </Text>
                      </View>
                    </View>

                    {/* Metadata details */}
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>{reader.name}</Text>
                      <Text style={styles.cardSpecialty} numberOfLines={1}>{reader.specialty}</Text>
                      
                      {/* Rating details */}
                      <View style={styles.ratingRow}>
                        <Star size={11} color="#C8E6FF" fill="#C8E6FF" />
                        <Text style={styles.ratingText}>{reader.rating.toFixed(1)}</Text>
                        <Text style={styles.cardSign}>· {reader.sign}</Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#111111',
  },
  titleText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 34,
  },
  subtitleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balancePill: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#222',
  },
  balanceText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#C8E6FF',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 120, // Tab bar safety spacing
  },
  filterBar: {
    marginBottom: 16,
  },
  filterBarContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    rowGap: 16,
  },
  cardWrapper: {
    width: cardWidth,
  },
  card: {
    width: '100%',
    backgroundColor: '#060606',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111111',
    overflow: 'hidden',
    padding: 8,
    borderCurve: 'continuous',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    zIndex: 10,
  },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  pulseDotActive: {
    backgroundColor: '#2EA84F',
  },
  pulseDotInactive: {
    backgroundColor: '#8A8A8A',
  },
  availabilityText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 9,
    color: '#FFFFFF',
  },
  cardInfo: {
    paddingTop: 8,
    paddingHorizontal: 4,
    gap: 2,
  },
  cardName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  cardSpecialty: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#8A8A8A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#C8E6FF',
    marginLeft: 4,
  },
  cardSign: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#555555',
    marginLeft: 4,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
});
