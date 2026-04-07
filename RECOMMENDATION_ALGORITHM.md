# Recommendation Algorithm

## Overview
The recommendation system provides personalized package suggestions based on ratings, booking history, and pricing to enhance user experience on the home page.

## Algorithm Components

### For Returning Users (Users with Booking History):

#### 1. Rating Factor (0-50 points)
- Packages with higher ratings receive more points
- Formula: `(packageRating / 5) * 50`
- A 5-star package gets 50 points, a 2.5-star gets 25 points

#### 2. Price Factor (0-20 points)
- **For packages with offers**: Higher discount percentage = higher score
  - Formula: `min((discount% / 50) * 20, 20)`
  - A 50% discount gets maximum 20 points
- **For regular packages**: Lower-priced packages get bonus points
  - Formula: `max(20 - packagePrice / 1000, 0)`

### For First-time Users (No Booking History):

#### 1. Pure Co-occurrence Analysis
- **Co-occurrence Matrix**: Analyzes which packages users frequently book together
- **User Pair Analysis**: If users A and B book the same package, it gets points
- **Pattern Recognition**: Identifies packages that work well together based on actual user behavior
- **No Popularity Bias**: Focuses purely on co-booking patterns, not overall popularity

### 4. User Preference Bonus (0-75 points) - For Returning Users
- **Category Match (up to 65 points)**: Strong bonus for categories user has booked before
- **Price Range Match (10 points)**: If package price is within 30% of user's average booking price

### 5. Collaborative Filtering (0-100 points) - For First-time Users
- **Co-occurrence Analysis Only**: Packages frequently booked together by multiple users
- **20 points per user pair** that booked the same package together
- **Maximum 100 points** for packages with strong co-occurrence patterns

**Example**: If users A and B both book Package X, and users B and C both book Package Y, then Package X and Y get collaborative scores for new user D based purely on how often they appear together in user bookings.

## Total Score
- **First-time Users**: Up to **100 points** (pure co-occurrence analysis)
- **Returning Users**: Up to **160+ points** (all factors combined)

## API Endpoint

### GET `/api/package/get-recommended-packages`

**Query Parameters:**
- `userId` (optional): User ID for personalized recommendations
- `limit` (optional, default: 12): Number of packages to return

**Response:**
```json
{
  "success": true,
  "packages": [
    {
      ...packageData,
      "recommendationScore": 85.5
    }
  ]
}
```

## Frontend Integration

The Home page now displays a "Recommended for You" section (or "Recommended Packages" for guests) at the top, showing the 8 highest-scoring packages based on the algorithm.

## Collaborative Filtering Example

**Scenario**: Users A, B, and C book packages as follows:
- User A books: Package X, Package Y
- User B books: Package X, Package Z  
- User C books: Package Y, Package Z

**For new User D** (first-time user):
1. **Package X** gets 20 points (booked by A and B together - 1 user pair)
2. **Package Y** gets 20 points (booked by A and C together - 1 user pair)  
3. **Package Z** gets 20 points (booked by B and C together - 1 user pair)
4. If more user pairs book the same packages, scores increase accordingly

**Result**: User D sees packages that users actually book together, indicating they complement each other well.

## Benefits

1. **Pure Co-occurrence Focus**: New users get packages based solely on what users book together
2. **Personalized Experience**: Returning users see packages matching their preferences
3. **Quality Focus**: High-rated packages are prioritized for returning users
4. **Value Emphasis**: Good deals and discounts are highlighted
5. **Pattern Recognition**: Identifies genuine booking patterns and package combinations
6. **No Popularity Bias**: Avoids recommending packages just because they're popular
7. **Dynamic**: Automatically adapts as new booking patterns emerge
