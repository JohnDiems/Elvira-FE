import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export type IconName = 
  | 'search' 
  | 'settings' 
  | 'cart' 
  | 'plus' 
  | 'minus' 
  | 'back' 
  | 'dashboard' 
  | 'inventory' 
  | 'profile' 
  | 'person-add'
  | 'lock' 
  | 'arrow-right' 
  | 'check' 
  | 'print' 
  | 'share' 
  | 'catalog' 
  | 'edit' 
  | 'close' 
  | 'logout' 
  | 'alert' 
  | 'trash' 
  | 'menu' 
  | 'shop'
  | 'home'
  | 'bell'
  | 'globe'
  | 'moon'
  | 'cafe';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 18, color = '#1C221F', style }: IconProps) {
  // Map our icon names to modern Ionicons vector representations (styled like Heroicons)
  switch (name) {
    case 'home':
      return <Ionicons name="home-outline" size={size} color={color} style={style} />;
    case 'bell':
      return <Ionicons name="notifications-outline" size={size} color={color} style={style} />;
    case 'globe':
      return <Ionicons name="globe-outline" size={size} color={color} style={style} />;
    case 'moon':
      return <Ionicons name="moon-outline" size={size} color={color} style={style} />;
    case 'search':
      return <Ionicons name="search-outline" size={size} color={color} style={style} />;
    case 'settings':
      return <Ionicons name="settings-outline" size={size} color={color} style={style} />;
    case 'cart':
      return <Ionicons name="cart-outline" size={size} color={color} style={style} />;
    case 'plus':
      return <Ionicons name="add" size={size} color={color} style={style} />;
    case 'minus':
      return <Ionicons name="remove" size={size} color={color} style={style} />;
    case 'back':
      return <Ionicons name="arrow-back" size={size} color={color} style={style} />;
    case 'dashboard':
      return <Ionicons name="bar-chart-outline" size={size} color={color} style={style} />;
    case 'inventory':
      return <Ionicons name="cube-outline" size={size} color={color} style={style} />;
    case 'profile':
      return <Ionicons name="person-outline" size={size} color={color} style={style} />;
    case 'person-add':
      return <Ionicons name="person-add-outline" size={size} color={color} style={style} />;
    case 'lock':
      return <Ionicons name="lock-closed-outline" size={size} color={color} style={style} />;
    case 'arrow-right':
      return <Ionicons name="arrow-forward" size={size} color={color} style={style} />;
    case 'check':
      return <Ionicons name="checkmark-circle-outline" size={size} color={color} style={style} />;
    case 'print':
      return <Ionicons name="print-outline" size={size} color={color} style={style} />;
    case 'share':
      return <Ionicons name="share-outline" size={size} color={color} style={style} />;
    case 'catalog':
      return <Ionicons name="receipt-outline" size={size} color={color} style={style} />;
    case 'edit':
      return <Ionicons name="create-outline" size={size} color={color} style={style} />;
    case 'close':
      return <Ionicons name="close" size={size} color={color} style={style} />;
    case 'logout':
      return <Ionicons name="log-out-outline" size={size} color={color} style={style} />;
    case 'alert':
      return <Ionicons name="warning-outline" size={size} color={color} style={style} />;
    case 'trash':
      return <Ionicons name="trash-outline" size={size} color={color} style={style} />;
    case 'menu':
      return <Ionicons name="menu" size={size} color={color} style={style} />;
    case 'shop':
      return <Ionicons name="storefront-outline" size={size} color={color} style={style} />;
    case 'cafe':
      return <Ionicons name="cafe-outline" size={size} color={color} style={style} />;
    default:
      return null;
  }
}

export default Icon;
