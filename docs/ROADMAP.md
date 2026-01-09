# Roadmap

This document outlines the planned features and improvements for ngopidi. Items are organized by priority and development phases.

## Current Version: 0.1.0

### Status: Alpha

The application has core functionality for coffee shop discovery with map-based browsing, user submissions, and admin moderation.

---

## Phase 0: Authentication & Place Submission System (Immediate Priority)

### High Priority

- [ ] **User Registration & Authentication**
  - User registration with email/password
  - Email verification system (user must click verification link before login)
  - Login/logout functionality
  - Protected routes for authenticated users

- [ ] **Place Submission Workflow**
  - Anonymous users can submit places via button on the map page
    - Default status: `PENDING`
    - PENDING places are NOT shown on the map
  - Registered users can submit places via dashboard
    - Default status: `UNVERIFIED`
    - Submitter is recorded in the database
    - UNVERIFIED places are shown on the map (name and location only, metadata hidden)

- [ ] **Place Status System**
  - Status types: `PENDING`, `UNVERIFIED`, `VERIFIED_USER`, `VERIFIED_ADMIN`
  - Visual differentiation with background colors:
    - `VERIFIED_USER`: Green
    - `VERIFIED_ADMIN`: Blue
    - `UNVERIFIED`: Grey/muted
    - `PENDING`: Not displayed on map

- [ ] **Place Verification System**
  - USER and ADMIN can verify places via dashboard, verifier will be recorded in the database
  - Verification by adding links or images as proof
  - Multiple users can verify the same place
  - Status changes to `VERIFIED_USER` or `VERIFIED_ADMIN` upon verification
  - Verification indicator shown in place modal on map page
  - Clickable verification badge to view verification data (links/images)

---

## Phase 1: Core Stabilization

### High Priority

- [ ] **Search & Filtering**
  - Implement search by location name, address, or coffee shop name
  - Add filters for amenities (WiFi, outlets, seating capacity)
  - Add filters for coffee shop characteristics (roaster, specialty, atmosphere)

- [ ] **User Experience Improvements**
  - Add mobile-responsive map controls
  - Implement image upload preview and validation
  - Add loading states and skeleton screens
  - Improve error handling and user feedback messages

- [ ] **Place Details Enhancement**
  - Add operating hours display
  - Show user-submitted photos in gallery
  - Display distance from user's current location
  - Add directions/navigation link integration

### Medium Priority

- [ ] **User Profiles**
  - User profile page with submission history
  - Ability to edit own submissions
  - Save favorite coffee shops

- [ ] **Notifications System**
  - Email notifications for submission status updates
  - Admin alerts for new submissions pending review

---

## Phase 2: Community Features

### High Priority

- [ ] **Reviews & Ratings**
  - 5-star rating system for coffee shops
  - Text reviews with character limit
  - Review moderation workflow
  - Display average ratings on map markers

- [ ] **Social Features**
  - User check-ins at coffee shops
  - Share coffee shop links on social media
  - User badges/achievements for contributions

### Medium Priority

- [ ] **Enhanced Moderation Tools**
  - Bulk approve/reject submissions
  - Flagging system for inappropriate content
  - Edit suggestions from community
  - Moderation activity log

- [ ] **Analytics Dashboard**
  - View counts per coffee shop
  - Submission trends over time
  - User engagement metrics
  - Popular locations heatmap

---

## Phase 3: Advanced Features

### High Priority

- [ ] **Mobile App**
  - React Native or PWA implementation
  - Offline map caching
  - Push notifications
  - Camera integration for photo uploads

- [ ] **AI-Powered Features**
  - Auto-categorization of coffee shop photos
  - Duplicate submission detection
  - Smart recommendations based on user preferences
  - Auto-complete for place submissions

### Medium Priority

- [ ] **Advanced Search**
  - "Coffee shops open now"
  - Search by roast preference or brewing method
  - Find coffee shops along a route
  - Group/event-friendly venue finder

- [ ] **Partnership Features**
  - Coffee shop owner verification
  - Business dashboard for owners
  - Special offers/events posting
  - Analytics for business accounts

---

## Phase 4: Scale & Polish

### High Priority

- [ ] **Performance Optimization**
  - Implement map marker clustering for dense areas
  - Add pagination for place listings
  - Optimize image loading and CDN integration
  - Database query optimization and indexing

- [ ] **Internationalization**
  - Multi-language support
  - Region-specific coffee shop categories
  - Currency and unit localization

### Medium Priority

- [ ] **API & Developer Tools**
  - Public API for coffee shop data
  - API documentation and playground
  - Rate limiting and API keys
  - Webhook support for data updates

- [ ] **Accessibility**
  - WCAG 2.1 AA compliance
  - Screen reader optimization
  - Keyboard navigation improvements
  - High contrast mode

---

## Future Considerations

### Under Evaluation

- Integration with third-party services (Google Maps, Apple Maps)
- Augmented reality features for navigation
- Coffee equipment marketplace
- Event hosting and meetup coordination
- Loyalty/rewards program integration
- White-label solution for other cities/categories

### Community Requests

- Export user data (favorites, reviews)
- Dark mode theme
- Custom map styles
- Import coffee shops from other platforms

---

## Technical Debt & Maintenance

### Ongoing

- [ ] Upgrade to latest Next.js stable releases
- [ ] Keep dependencies up-to-date
- [ ] Improve test coverage (target: 80%)
- [ ] Set up automated E2E testing
- [ ] Implement comprehensive monitoring and logging
- [ ] Database backup automation
- [ ] Security audit and penetration testing

---

## Contributing to the Roadmap

Have ideas or suggestions? Please:

1. Open an issue on GitHub with the `feature-request` label
2. Join our community discussions
3. Submit a pull request with detailed proposals

Last updated: 2026-01-09
