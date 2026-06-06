import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, DimensionValue } from 'react-native';
import Svg, { Line } from 'react-native-svg';

export type CelestialBackgroundProps = {
  density?: "low" | "medium" | "high";
  showConstellation?: boolean;
  intensity?: number;
  constellationDelay?: number;
};

interface Star {
  id: number;
  top: DimensionValue;
  left: DimensionValue;
  size: number;
  baseOpacity: number;
  twinkleIndex: number; // -1 if static, 0-4 if twinkling
}

export default function CelestialBackground({
  density = "medium",
  showConstellation = false,
  intensity = 1.0,
  constellationDelay = 4000,
}: CelestialBackgroundProps) {
  
  // 1. Generate Star Coordinates (memoized once per density)
  const stars = useMemo<Star[]>(() => {
    const starCount = density === "high" ? 130 : density === "medium" ? 80 : 40;
    const starArray: Star[] = [];
    
    for (let i = 0; i < starCount; i++) {
      const top = Math.random() * 100;
      const left = Math.random() * 100;
      
      // Sizes: ~80% tiny (1px), ~15% medium (2px), ~5% bright (3-4px)
      const sizeRand = Math.random();
      const size = sizeRand < 0.80 ? 1 : sizeRand < 0.95 ? 2 : Math.random() < 0.5 ? 3 : 4;
      
      const baseOpacity = Math.random() * 0.45 + 0.15; // 0.15 to 0.60
      
      // ~12% stars twinkle
      const twinkleIndex = Math.random() < 0.12 ? Math.floor(Math.random() * 5) : -1;
      
      starArray.push({
        id: i,
        top: `${top}%`,
        left: `${left}%`,
        size,
        baseOpacity,
        twinkleIndex,
      });
    }
    return starArray;
  }, [density]);

  // 2. Shared Twinkling Opacities to prevent CPU overload
  const twinkleAnims = useRef(
    Array.from({ length: 5 }, () => new Animated.Value(Math.random() * 0.6 + 0.4))
  ).current;

  useEffect(() => {
    const loops = twinkleAnims.map((anim, i) => {
      const duration = 250 + i * 80;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.2,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1.0,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    });

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [twinkleAnims]);

  // 3. Slow Space Parallax Drift
  const driftX = useRef(new Animated.Value(0)).current;
  const driftY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(driftX, { toValue: 10, duration: 4000, useNativeDriver: true }),
          Animated.timing(driftX, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(driftY, { toValue: -8, duration: 4000, useNativeDriver: true }),
          Animated.timing(driftY, { toValue: 0, duration: 4000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // 4. Constellation Segment Opacities
  const constellationOpacity = useRef(new Animated.Value(0)).current;
  const line1Opacity = useRef(new Animated.Value(0)).current;
  const line2Opacity = useRef(new Animated.Value(0)).current;
  const line3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showConstellation) return;

    let isCancelled = false;

    const runConstellationCycle = () => {
      if (isCancelled) return;

      constellationOpacity.setValue(0);
      line1Opacity.setValue(0);
      line2Opacity.setValue(0);
      line3Opacity.setValue(0);

      Animated.sequence([
        // 1. Fade in constellation node stars
        Animated.timing(constellationOpacity, {
          toValue: 0.8 * intensity,
          duration: 400,
          useNativeDriver: true,
        }),
        // 2. Draw line segment 1
        Animated.timing(line1Opacity, {
          toValue: 0.5 * intensity,
          duration: 200,
          useNativeDriver: true,
        }),
        // 3. Draw line segment 2
        Animated.timing(line2Opacity, {
          toValue: 0.5 * intensity,
          duration: 200,
          useNativeDriver: true,
        }),
        // 4. Draw line segment 3
        Animated.timing(line3Opacity, {
          toValue: 0.5 * intensity,
          duration: 200,
          useNativeDriver: true,
        }),
        // 5. Hold constellation fully visible
        Animated.delay(1000),
        // 6. Fade out lines and nodes
        Animated.parallel([
          Animated.timing(constellationOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(line1Opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(line2Opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(line3Opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
        // 7. Delay before next cycle starts
        Animated.delay(constellationDelay),
      ]).start(() => {
        if (!isCancelled) runConstellationCycle();
      });
    };

    runConstellationCycle();

    return () => {
      isCancelled = true;
    };
  }, [showConstellation, intensity, constellationDelay]);

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Background Star Field with Slow Drift */}
      <Animated.View style={[
        StyleSheet.absoluteFill,
        {
          transform: [
            { translateX: driftX },
            { translateY: driftY }
          ]
        }
      ]}>
        {stars.map((star) => {
          // Calculate active opacity: base * twinkleAnim * overallIntensity
          const starOpacity = star.twinkleIndex !== -1
            ? Animated.multiply(twinkleAnims[star.twinkleIndex], star.baseOpacity * intensity)
            : star.baseOpacity * intensity;

          return (
            <Animated.View
              key={star.id}
              style={[
                styles.star,
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  borderRadius: star.size / 2,
                  opacity: starOpacity,
                  backgroundColor: star.size >= 3 ? '#C8E6FF' : '#FFFFFF',
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Constellation Animations */}
      {showConstellation && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Constellation 1 (Top Right quadrant) */}
          <View style={styles.constellationOne}>
            <Svg width="180" height="150" viewBox="0 0 180 150">
              <AnimatedLine x1="20" y1="30" x2="60" y2="70" stroke="#C8E6FF" strokeWidth="0.75" opacity={line1Opacity} />
              <AnimatedLine x1="60" y1="70" x2="110" y2="40" stroke="#C8E6FF" strokeWidth="0.75" opacity={line2Opacity} />
              <AnimatedLine x1="110" y1="40" x2="160" y2="90" stroke="#C8E6FF" strokeWidth="0.75" opacity={line3Opacity} />
            </Svg>
            {/* Constellation Nodes (aligned to coordinates above) */}
            <Animated.View style={[styles.constellationNode, { top: 30, left: 20, opacity: constellationOpacity }]} />
            <Animated.View style={[styles.constellationNode, { top: 70, left: 60, opacity: constellationOpacity }]} />
            <Animated.View style={[styles.constellationNode, { top: 40, left: 110, opacity: constellationOpacity }]} />
            {/* Bright Endpoint Star */}
            <Animated.View style={[
              styles.constellationNode, 
              styles.brightNode, 
              { top: 90, left: 160, opacity: constellationOpacity }
            ]} />
          </View>

          {/* Constellation 2 (Bottom Left quadrant) */}
          <View style={styles.constellationTwo}>
            <Svg width="160" height="150" viewBox="0 0 160 150">
              <AnimatedLine x1="20" y1="110" x2="60" y2="70" stroke="#C8E6FF" strokeWidth="0.75" opacity={line1Opacity} />
              <AnimatedLine x1="60" y1="70" x2="100" y2="90" stroke="#C8E6FF" strokeWidth="0.75" opacity={line2Opacity} />
              <AnimatedLine x1="100" y1="90" x2="140" y2="30" stroke="#C8E6FF" strokeWidth="0.75" opacity={line3Opacity} />
            </Svg>
            {/* Constellation Nodes */}
            <Animated.View style={[styles.constellationNode, { top: 110, left: 20, opacity: constellationOpacity }]} />
            <Animated.View style={[styles.constellationNode, { top: 70, left: 60, opacity: constellationOpacity }]} />
            <Animated.View style={[styles.constellationNode, { top: 90, left: 100, opacity: constellationOpacity }]} />
            {/* Bright Endpoint Star */}
            <Animated.View style={[
              styles.constellationNode, 
              styles.brightNode, 
              { top: 30, left: 140, opacity: constellationOpacity }
            ]} />
          </View>
        </View>
      )}
    </View>
  );
}

// Convert Svg Line into an animatable component
const AnimatedLine = Animated.createAnimatedComponent(Line);

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
  },
  constellationOne: {
    position: 'absolute',
    top: '15%',
    right: '8%',
    width: 180,
    height: 150,
  },
  constellationTwo: {
    position: 'absolute',
    bottom: '22%',
    left: '8%',
    width: 160,
    height: 150,
  },
  constellationNode: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    transform: [{ translateX: -1.5 }, { translateY: -1.5 }],
  },
  brightNode: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C8E6FF',
    transform: [{ translateX: -3 }, { translateY: -3 }],
    shadowColor: '#C8E6FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
