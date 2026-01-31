const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');

// Get all users. Returns full list for admins, public fields for non-admins
const getAllUsers = async (req, res) => {
    try {
        const isAdmin = req.user && Array.isArray(req.user.roles) && req.user.roles.includes('admin');

        if (isAdmin) {
            const users = await User.find({})
                .select('-password')
                .sort({ createdAt: -1 });
            return res.status(200).json({ data: users });
        }

        // Non-admin: return limited public fields only and exclude admin accounts
        const usersPublic = await User.find({ roles: { $nin: ['admin'] } })
            .select('firstName lastName mobile phone occupationProfile occupationType occupationDescription buildingName flatNo')
            .sort({ createdAt: -1 });

        return res.status(200).json({ data: usersPublic });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Generate or regenerate a family code for the authenticated owner
const generateFamilyCode = async (req, res) => {
    // Family codes are deprecated; respond with Gone
    return res.status(410).json({ message: 'Family codes feature removed' });
};

// Join a family by code (authenticated user becomes member)
const joinFamilyByCode = async (req, res) => {
    // Joining families by code is deprecated
    return res.status(410).json({ message: 'Join family feature removed' });
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        // Family/member concepts removed — proceed with profile update
        const {
            name, phone, address, birthdate, bio,
            firstName, middleName, lastName, buildingName, wing, flatNo,
            occupationProfile, occupationType, occupationDescription, workplaceAddress,
            forumContribution, residenceType, gender
        } = req.body;
        // Family members and counts have been deprecated; profile updates no longer accept those fields.

        // Find user by ID and update
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: name || '',
                    phone: phone || '',
                    address: address || '',
                    birthdate: birthdate || null,
                    bio: bio || '',
                    firstName: firstName || '',
                    middleName: middleName || '',
                    lastName: lastName || '',
                    buildingName: buildingName || '',
                    wing: wing || '',
                    flatNo: flatNo || '',
                    occupationProfile: occupationType ? `${occupationType}${occupationDescription ? ' - ' + occupationDescription : ''}` : (occupationDescription || occupationProfile || ''),
                    occupationType: occupationType || '',
                    occupationDescription: occupationDescription || '',
                    workplaceAddress: workplaceAddress || '',
                    gender: gender || '',
                    forumContribution: forumContribution || '',
                    residenceType: residenceType || ''
                }
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Family member account creation removed as family model is deprecated

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Update user password
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        // Password strength validation
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        // Find user
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password', error: error.message });
    }
};

// Update user preferences
const updatePreferences = async (req, res) => {
    try {
        const { notifications, appearance } = req.body;

        // Prepare update object
        const updateData = {};

        // Update notifications if provided
        if (notifications) {
            updateData['preferences.notifications'] = {};

            if (notifications.emailNotifications !== undefined) {
                updateData['preferences.notifications.emailNotifications'] = notifications.emailNotifications;
            }

            if (notifications.eventReminders !== undefined) {
                updateData['preferences.notifications.eventReminders'] = notifications.eventReminders;
            }

            if (notifications.donationReceipts !== undefined) {
                updateData['preferences.notifications.donationReceipts'] = notifications.donationReceipts;
            }

            if (notifications.newsletters !== undefined) {
                updateData['preferences.notifications.newsletters'] = notifications.newsletters;
            }

            if (notifications.marketingEmails !== undefined) {
                updateData['preferences.notifications.marketingEmails'] = notifications.marketingEmails;
            }
        }

        // Update appearance if provided
        if (appearance) {
            updateData['preferences.appearance'] = {};

            if (appearance.theme && ['light', 'dark', 'system'].includes(appearance.theme)) {
                updateData['preferences.appearance.theme'] = appearance.theme;
            }

            if (appearance.fontSize && ['small', 'medium', 'large'].includes(appearance.fontSize)) {
                updateData['preferences.appearance.fontSize'] = appearance.fontSize;
            }

            if (appearance.language && ['english', 'arabic', 'french'].includes(appearance.language)) {
                updateData['preferences.appearance.language'] = appearance.language;
            }
        }

        // Update user preferences
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: {
                notifications: updatedUser.preferences.notifications,
                appearance: updatedUser.preferences.appearance
            }
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ message: 'Error updating preferences', error: error.message });
    }
};

// Export users as CSV
const exportUsersCSV = async (req, res) => {
    try {
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        const users = await User.find({}).select('-password -__v');
        // Map users to a clean, admin-friendly row format
        const rows = users.map(u => {
            const o = u.toObject ? u.toObject() : u;
            return {
                'User ID': o.customId || o._id,
                'Name': `${o.firstName || ''} ${o.lastName || ''}`.trim(),
                'Mobile': o.mobile || '',
                'Email': o.email || '',
                'Phone': o.phone || '',
                'Roles': Array.isArray(o.roles) ? o.roles.join('; ') : (o.roles || ''),
                'Status': o.status || '',
                'Created At': o.createdAt ? new Date(o.createdAt).toISOString() : '',
                'Address': [o.buildingName, o.wing, o.flatNo, o.address].filter(Boolean).join(', '),
                'Residence Type': o.residenceType || '',
                'Organization': o.organization || ''
            };
        });

        const fields = [
            'User ID', 'Name', 'Mobile', 'Email', 'Phone', 'Roles', 'Status', 'Created At', 'Address', 'Residence Type', 'Organization'
        ];

        const parser = new Parser({ fields, quote: '"' });
        const csv = parser.parse(rows);
        res.header('Content-Type', 'text/csv; charset=utf-8');
        // Suggest a filename with date
        const filename = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
        res.attachment(filename);
        return res.send(csv);
    } catch (error) {
        console.error('Error exporting users as CSV:', error);
        res.status(500).json({ message: 'Failed to export users as CSV', error: error.message });
    }
};

// Export users as PDF
const exportUsersPDF = async (req, res) => {
    // TODO: Implement PDF export logic
    res.status(501).json({ message: 'PDF export not implemented yet' });
};

// Export users as Excel
const exportUsersExcel = async (req, res) => {
    // TODO: Implement Excel export logic
    res.status(501).json({ message: 'Excel export not implemented yet' });
};

// Import users from file
const importUsers = async (req, res) => {
    // TODO: Implement import logic
    res.status(501).json({ message: 'Import not implemented yet' });
};

// Delete a user by ID (admin only)
const deleteUser = async (req, res) => {
    try {
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        const userId = req.params.id;
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Post-delete family cleanup removed (family model deprecated)

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
};

// Get users by owner id (members belonging to owner)
const getUsersByOwner = async (req, res) => {
    try {
        const ownerId = req.params.id;
        if (!ownerId) return res.status(400).json({ message: 'Owner id required' });
        // Find users with explicit familyOf pointer
        let members = await User.find({ familyOf: ownerId }).select('-password');
        // Also find users with placeholder phone pattern fm_<customId>_
        const owner = await User.findById(ownerId).select('customId');
        if (owner && owner.customId) {
            const regex = new RegExp(`^fm_${owner.customId}`, 'i');
            const others = await User.find({ mobile: { $regex: regex } }).select('-password');
            // merge unique
            const map = new Map();
            members.forEach(m => map.set(String(m._id), m));
            others.forEach(o => map.set(String(o._id), o));
            members = Array.from(map.values());
        }
        res.status(200).json({ data: members });
    } catch (error) {
        console.error('Error getting users by owner:', error);
        res.status(500).json({ message: 'Failed to get members', error: error.message });
    }
};

const deleteMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Optional: Add logic here to clean up other user-related data
        // For example, anonymize their registrations, etc.

        res.status(200).json({ message: 'Your account has been successfully deleted' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ message: 'Failed to delete your account', error: error.message });
    }
};

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        const userId = req.params.id;
        const updateData = req.body;
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
};

// Add user (admin only)
const createUser = async (req, res) => {
    try {
        // Only admin can add users
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        const {
            firstName, lastName, mobile, email, password, phone, address, organization, roles, status,
            buildingName, wing, flatNo, dob, bio, residenceType, workplaceAddress, forumContribution, gender
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !mobile || !email || !password || !buildingName || !wing || !flatNo) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        // Check for existing user (by email or mobile)
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email or mobile already exists.' });
        }

        // Generate customId using same logic as public registration:
        // 'R' + first 2 letters of second word in buildingName (if present, uppercase) + wing (uppercase) + flatNo + first 2 digits of mobile
        let buildingCode = 'R';
        const buildingWords = (buildingName || '').trim().split(/\s+/);
        if (buildingWords.length > 1 && buildingWords[1].length >= 2) {
            buildingCode += buildingWords[1].substring(0, 2).toUpperCase();
        }
        const wingCode = (wing || '').toUpperCase();
        const flatCode = flatNo || '';
        const mobileCode = (mobile || '').substring(0, 2);
        // Append gender token if provided (M/F)
        const g = String(gender || '').trim().toUpperCase();
        let genderToken = '';
        if (g.startsWith('M')) genderToken = 'M';
        else if (g.startsWith('F')) genderToken = 'F';
        // Always append (may be empty)
        let customId = `${buildingCode}${wingCode}${flatCode}${mobileCode}${genderToken}`;
        // Ensure uniqueness (append a number if needed)
        let uniqueCustomId = customId;
        let suffix = 1;
        while (await User.findOne({ customId: uniqueCustomId })) {
            uniqueCustomId = `${customId}${suffix}`;
            suffix++;
        }
        customId = uniqueCustomId;

        // Create user
        const user = new User({
            firstName,
            lastName,
            mobile,
            email,
            password,
            phone,
            address,
            organization,
            roles: roles || ['user'],
            status: status || 'approved',
            buildingName,
            wing,
            flatNo,
            birthdate: dob ? new Date(dob) : undefined,
            bio,
            residenceType,
            workplaceAddress: workplaceAddress || '',
            forumContribution: forumContribution || '',
            gender: gender || '',
            customId
        });
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;

        // Send response immediately, don't wait for email
        res.status(201).json(userObj);

        // Send email AFTER response (using setImmediate to ensure it runs in next tick)
        setImmediate(async () => {
            try {
                const fullName = `${firstName} ${lastName}`;
                const { sendCredentialsEmail } = require('../config/mail');
                await sendCredentialsEmail(email, fullName, user.customId, password);
                console.log('Credentials email sent to:', email);
            } catch (emailError) {
                console.error('Failed to send credentials email to created user:', emailError);
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    updatePassword,
    updatePreferences,
    getAllUsers,
    generateFamilyCode,
    joinFamilyByCode,
    getUsersByOwner,
    exportUsersCSV,
    exportUsersPDF,
    exportUsersExcel,
    importUsers,
    deleteUser,
    updateUser,
    deleteMyProfile,
    createUser
};