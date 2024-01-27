export interface DeliveryFeeInput {
  distance: number;
  cartValue: number;
  itemCount: number;
  isRushHour?: boolean;
}
