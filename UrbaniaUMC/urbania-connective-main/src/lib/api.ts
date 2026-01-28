import api from './axios';

// Auth APIs
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  register: (data: { firstName: string; middleName?: string; lastName: string; mobile: string; email: string; password: string; buildingName: string; wing: string; flatNo: string; birthdate?: string; occupationProfile?: string; occupationType?: string; occupationDescription?: string; workplaceAddress?: string; forumContribution?: string; residenceType?: 'owner' | 'tenant'; gender?: 'M' | 'F' }) =>
    api.post('/api/auth/register', data),
  adminRegister: (data: { firstName: string; middleName?: string; lastName?: string; mobile: string; email: string; password: string; buildingName: string; wing: string; flatNo: string; birthdate?: string; occupationProfile?: string; occupationType?: string; occupationDescription?: string; workplaceAddress?: string; forumContribution?: string; residenceType?: 'owner' | 'tenant'; gender?: 'M' | 'F' }) =>
    api.post('/api/auth/admin-register', data),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
  forgotPassword: (data: { email: string }) =>
    api.post('/api/auth/forgot-password', data),
  resetPassword: (data: { token: string; newPassword: string }) =>
    api.post('/api/auth/reset-password', data),
};

// User APIs
export const userAPI = {
  // Profile
  // Use auth profile endpoint which returns owner+member when applicable
  getProfile: () => api.get('/api/auth/profile'),
  updateProfile: (data: {
    name?: string;
    phone?: string;
    address?: string;
    birthdate?: string;
    bio?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    buildingName?: string;
    wing?: string;
    flatNo?: string;
    occupationProfile?: string;
    workplaceAddress?: string;
    forumContribution?: string;
    residenceType?: 'owner' | 'tenant';
    gender?: 'M' | 'F';
  }) => api.put('/api/users/profile', data),
  
  // Password
  updatePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/api/users/password', data),
  
  // Preferences
  updatePreferences: (data: {
    notifications?: {
      emailNotifications?: boolean;
      eventReminders?: boolean;
      donationReceipts?: boolean;
      newsletters?: boolean;
      marketingEmails?: boolean;
    };
    appearance?: {
      theme?: 'light' | 'dark' | 'system';
      fontSize?: 'small' | 'medium' | 'large';
      language?: 'english' | 'arabic' | 'french';
    };
  }) => api.put('/api/users/preferences', data),
  
  // Delete my profile
  deleteMyProfile: () => api.delete('/api/users/profile'),
  
  // Admin functions
  getUsers: () => api.get('/api/users'),
  getUserById: (id: string) => api.get(`/api/users/${id}`),
  getAllUsers: () => api.get('/api/users/all'),
  getUsersByOwner: (ownerId: string) => api.get(`/api/users/by-owner/${ownerId}`),
  
};
export const eventAPI = {
  getEvents: () => api.get('/api/events'),
  getEventById: (id: string) => api.get(`/api/events/${id}`),
  createEvent: (data: any) => api.post('/api/events', data),
  updateEvent: (id: string, data: any) => api.put(`/api/events/${id}`, data),
  deleteEvent: (id: string) => api.delete(`/api/events/${id}`),
};

// Workshop APIs
export const workshopAPI = {
  getWorkshops: () => api.get('/api/workshops'),
  getWorkshopById: (id: string) => api.get(`/api/workshops/${id}`),
  createWorkshop: (data: any) => api.post('/api/workshops', data),
  updateWorkshop: (id: string, data: any) => api.put(`/api/workshops/${id}`, data),
  deleteWorkshop: (id: string) => api.delete(`/api/workshops/${id}`),
};

// Community APIs
export const communityAPI = {
  getCommunities: () => api.get('/api/communities'),
  getCommunityById: (id: string) => api.get(`/api/communities/${id}`),
  createCommunity: (data: any) => api.post('/api/communities', data),
  updateCommunity: (id: string, data: any) => api.put(`/api/communities/${id}`, data),
  deleteCommunity: (id: string) => api.delete(`/api/communities/${id}`),
};

// Post APIs
export const postAPI = {
  getPosts: () => api.get('/api/posts'),
  getPostById: (id: string) => api.get(`/api/posts/${id}`),
  createPost: (data: any) => api.post('/api/posts', data),
  updatePost: (id: string, data: any) => api.put(`/api/posts/${id}`, data),
  deletePost: (id: string) => api.delete(`/api/posts/${id}`),
};

// Donation APIs
export const donationAPI = {
  // Process a donation with Razorpay
  processDonation: (data: {
    _id: string;
    donor: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    amount: number;
    currency?: string;
    program?: string;
    donationType?: 'one-time' | 'recurring';
    recurringFrequency?: 'monthly' | 'quarterly' | 'yearly';
    anonymous?: boolean;
    message?: string;
    receiptRequired?: boolean;
  }) => api.post('/api/donations/process', data),
  
  // Confirm successful payment
  confirmPayment: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    receiptRequired?: boolean;
  }) => api.post('/api/donations/payment-success', data),
  
  // Get authenticated user's donations
  getMyDonations: (page = 1, limit = 10) => 
    api.get(`/api/donations/my-donations?page=${page}&limit=${limit}`),
  
  getDonationById: (id: string) => 
    api.get(`/api/donations/my-donations/${id}`),
  
  cancelRecurringDonation: (id: string) => 
    api.post(`/api/donations/cancel/${id}`),
  
  // Admin functions
  getAllDonations: (params: {
    page?: number;
    limit?: number;
    program?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.program) queryParams.append('program', params.program);
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.minAmount) queryParams.append('minAmount', params.minAmount.toString());
    if (params.maxAmount) queryParams.append('maxAmount', params.maxAmount.toString());
    
    return api.get(`/api/donations?${queryParams.toString()}`);
  },
  
  getDonationStats: (params: {
    program?: string;
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.program) queryParams.append('program', params.program);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    return api.get(`/api/donations/stats?${queryParams.toString()}`);
  }
};

// Volunteer API (client-side hooks used across app)
export const volunteerAPI = {
  apply: (data: any) => api.post('/api/volunteers/apply', data),
  checkEmailExists: (email: string) => api.get(`/api/volunteers/check-email?email=${encodeURIComponent(email)}`),
  getMyVolunteerProfile: () => api.get('/api/volunteers/me'),
  getVolunteersByUserId: (userId: string) => api.get(`/api/volunteers/by-user/${userId}`),
  getVolunteersByVolunteerId: (volunteerId: string) => api.get(`/api/volunteers/by-volunteer/${volunteerId}`),
};

// Registration APIs - for all types of registrations
export const registrationAPI = {
  // General Registration (memberships)
  createGeneralRegistration: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    membershipType: string;
    membershipDuration?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship?: string;
    };
    gender?: 'M' | 'F';
    demographicInfo?: any;
    paymentInfo?: any;
    referralSource?: string;
    interests?: string;
    volunteerPreferences?: string[];
    specialRequests?: string;
    agreeTerms: boolean;
    receiveUpdates?: boolean;
  }) => api.post('/api/registrations/general', data),
  
  getMyGeneralRegistrations: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations/general?${queryParams.toString()}`);
  },
  
  // Program Registration
  createProgramRegistration: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    programId: string;
    programName: string;
    sessionPreference: string;
    participantAge?: string;
    // participantGender removed; use gender
    numberOfParticipants?: string;
    additionalParticipants?: any[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship?: string;
    };
    medicalInformation?: string;
    paymentInfo?: {
      method: string;
    };
    scholarshipRequested?: boolean;
    scholarshipDetails?: string;
    specialRequests?: string;
    agreeTerms: boolean;
  }) => api.post('/api/registrations/program', data),
  
  getMyProgramRegistrations: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations/program?${queryParams.toString()}`);
  },
  
  // Event Registration
  createEventRegistration: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    ticketType?: string;
    ticketQuantity?: string;
    guests?: any[];
    dietaryRestrictions?: string;
    accessibilityNeeds?: string;
    ticketPrice?: number;
    totalAmount?: number;
    paymentInfo?: {
      method: string;
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };
    promoCode?: string;
    discountAmount?: number;
    sendReminders?: boolean;
    specialRequests?: string;
    agreeTerms: boolean;
  }) => api.post('/api/registrations/event', data),
  
  getMyEventRegistrations: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations/event/my?${queryParams.toString()}`);
  },
  
  // Service Request
  createServiceRequest: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    serviceType: string;
    requestTitle: string;
    description: string;
    urgency?: string;
    preferredDate?: string;
    preferredTime?: string;
    recurring?: boolean;
    recurringFrequency?: string;
    // householdMembers removed
    incomeVerification?: {
      hasIncome?: boolean;
      incomeSource?: string;
      eligibleForAssistance?: boolean;
    };
    referredBy?: string;
    specialRequests?: string;
    agreeTerms: boolean;
    agreeToFollowUp?: boolean;
  }) => api.post('/api/registrations/service', data),
  
  getMyServiceRequests: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations/service?${queryParams.toString()}`);
  },
  
  // Volunteer Registration
  createVolunteerRegistration: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    volunteerType: string;
    availability?: {
      weekdays?: boolean;
      weekends?: boolean;
      timePreference?: string[];
      specificDays?: string[];
      hoursPerWeek?: number;
    };
    skills?: string[];
    interests?: string[];
    areasOfInterest?: string[];
    previousExperience?: string;
    yearsOfExperience?: number;
    backgroundCheck?: {
      required?: boolean;
      completed?: boolean;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship?: string;
    };
    references?: {
      name: string;
      relationship: string;
      phone?: string;
      email?: string;
    }[];
    specialRequests?: string;
    agreeTerms: boolean;
  }) => api.post('/api/registrations/volunteer', data),
  
  getMyVolunteerRegistrations: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations/volunteer?${queryParams.toString()}`);
  },
  
  // Volunteer Hours
  logVolunteerHours: (data: {
    date: string;
    startTime: string;
    endTime: string;
    program: string;
    description: string;
    location?: string;
    skills?: string[];
    supervisorName?: string;
    notes?: string;
  }) => api.post('/api/volunteer-hours', data),
  
  getMyVolunteerHours: (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    program?: string;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.program) queryParams.append('program', params.program);
    if (params.status) queryParams.append('status', params.status);
    
    return api.get(`/api/volunteer-hours?${queryParams.toString()}`);
  },
  
  updateVolunteerHours: (id: string, data: any) => 
    api.put(`/api/volunteer-hours/${id}`, data),
  
  deleteVolunteerHours: (id: string) => 
    api.delete(`/api/volunteer-hours/${id}`),
    
  // General registration functions
  getAllRegistrations: (params: any = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/api/registrations?${queryParams.toString()}`);
  },
  
  getRegistrationById: (id: string) => 
    api.get(`/api/registrations/${id}`),
    
  updateRegistrationStatus: (id: string, data: { status: string, note?: string }) => 
    api.put(`/api/registrations/${id}/status`, data),
    
  deleteRegistration: (id: string) => 
    api.delete(`/api/registrations/${id}`),

  getRegistrationDetails: async (registrationId: string) => {
    try {
      const response = await api.get(`/api/registrations/${registrationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching registration details:', error);
      throw error;
    }
  },
};

// Course Registration APIs
export const courseRegistrationAPI = {
  getMyRegistrations: () => api.get('/api/course-registration/my-registrations'),
}; 