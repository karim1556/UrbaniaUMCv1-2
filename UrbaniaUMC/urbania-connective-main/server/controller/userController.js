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
    try {
        // Only owners (non-family-member accounts) should generate codes
        if (req.user && req.user.familyOf) {
            return res.status(403).json({ message: 'Family members cannot generate family codes.' });
        }
        const owner = await User.findById(req.user._id);
        if (!owner) return res.status(404).json({ message: 'User not found' });

        // Generate a short code: 6 chars base36 from random bytes + owner's customId suffix
        const crypto = require('crypto');
        const rnd = crypto.randomBytes(4).toString('hex').slice(0,6).toUpperCase();
        const code = `${rnd}`;

        // Persist familyCode using an update to avoid running full document validation
        // (some legacy users may have invalid roles array values that fail validation)
        await User.findByIdAndUpdate(owner._id, { $set: { familyCode: code } });

        res.status(200).json({ message: 'Family code generated', code });
    } catch (error) {
        console.error('Error generating family code:', error);
        res.status(500).json({ message: 'Error generating family code', error: error.message });
    }
};

// Join a family by code (authenticated user becomes member)
const joinFamilyByCode = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: 'Code is required' });

        const member = await User.findById(req.user._id);
        if (!member) return res.status(404).json({ message: 'User not found' });

        // Prevent owners from joining
        if (member.familyOf) return res.status(400).json({ message: 'You are already linked to a family.' });

        // Find owner by familyCode (case-insensitive)
        const owner = await User.findOne({ familyCode: { $regex: `^${code}$`, $options: 'i' } });
        if (!owner) return res.status(404).json({ message: 'Family code not found' });

        // Link member: use findByIdAndUpdate to avoid running full document validation
        await User.findByIdAndUpdate(member._id, { $set: { familyOf: owner._id } });
        const updatedMember = await User.findById(member._id).select('-password');

        // Add to owner's familyMembers if not already present
        const email = (member.email || '').toLowerCase();
        const exists = owner.familyMembers && owner.familyMembers.some(m => m.email && m.email.toLowerCase() === email);
        if (!exists) {
            owner.familyMembers = owner.familyMembers || [];
            owner.familyMembers.push({ name: `${member.firstName || ''} ${member.lastName || ''}`.trim(), email: email, age: member.birthdate ? new Date().getFullYear() - new Date(member.birthdate).getFullYear() : undefined, category: 'other' });
            await owner.save();
        }

        // Return sanitized owner and updated member
        const ownerSanitized = await User.findById(owner._id).select('-password');
        return res.status(200).json({ message: 'Joined family successfully', owner: ownerSanitized.toObject(), member: updatedMember.toObject() });
    } catch (error) {
        console.error('Error joining family by code:', error);
        res.status(500).json({ message: 'Error joining family', error: error.message });
    }
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
        // Prevent family-member accounts from editing owner profile or their own details via this endpoint
        if (req.user && req.user.familyOf) {
            return res.status(403).json({ message: 'Family member accounts are not allowed to edit profile information.' });
        }
        const {
            name, phone, address, birthdate, bio,
            firstName, middleName, lastName, buildingName, wing, flatNo,
            occupationProfile, occupationType, occupationDescription, workplaceAddress, familyCount,
            maleAbove18, maleAbove60, maleUnder18,
            femaleAbove18, femaleAbove60, femaleUnder18,
            forumContribution
            , residenceType,
            familyMembers
        } = req.body;

        // Validate familyMembers length doesn't exceed familyCount
        if (Array.isArray(familyMembers)) {
            const existingUser = await User.findById(req.user._id).select('familyCount');
            const allowed = familyCount || (existingUser && existingUser.familyCount) || 0;
            if (allowed && familyMembers.length > allowed) {
                return res.status(400).json({ message: `You can only add up to ${allowed} family members.` });
            }
        }

        // Validate category allocations do not exceed profile's counts
        if (Array.isArray(familyMembers)) {
            const counts = {
                male_18_60: Number(maleAbove18 || 0),
                male_above_60: Number(maleAbove60 || 0),
                male_under_18: Number(maleUnder18 || 0),
                female_18_60: Number(femaleAbove18 || 0),
                female_above_60: Number(femaleAbove60 || 0),
                female_under_18: Number(femaleUnder18 || 0)
            };
            const usage = {
                male_18_60: 0,
                male_above_60: 0,
                male_under_18: 0,
                female_18_60: 0,
                female_above_60: 0,
                female_under_18: 0
            };
            familyMembers.forEach(m => {
                if (m && m.category && usage[m.category] !== undefined) usage[m.category]++;
            });
            for (const key of Object.keys(usage)) {
                if (counts[key] !== undefined && usage[key] > counts[key]) {
                    return res.status(400).json({ message: `Too many members in category ${key}. Maximum allowed is ${counts[key]}.` });
                }
            }
        }

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
                    familyCount: familyCount || 0,
                    maleAbove18: maleAbove18 || 0,
                    maleAbove60: maleAbove60 || 0,
                    maleUnder18: maleUnder18 || 0,
                    femaleAbove18: femaleAbove18 || 0,
                    femaleAbove60: femaleAbove60 || 0,
                    femaleUnder18: femaleUnder18 || 0,
                    forumContribution: forumContribution || '',
                    residenceType: residenceType || '',
                    familyMembers: Array.isArray(familyMembers) ? familyMembers : []
                }
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // After saving profile, create accounts for new family members (if they don't exist)
        try {
            const owner = await User.findById(req.user._id);
            const { sendAccountCreatedNotice } = require('../config/mail');
            for (const m of familyMembers || []) {
                if (!m || !m.email) continue;
                const exists = await User.findOne({ email: m.email });
                if (exists) continue;

                // Generate customId similar to registration
                let buildingCode = 'R';
                const buildingWords = (buildingName || '').trim().split(/\s+/);
                if (buildingWords.length > 1 && buildingWords[1].length >= 2) {
                    buildingCode += buildingWords[1].substring(0, 2).toUpperCase();
                }
                const wingCode = (wing || '').toUpperCase();
                const flatCode = flatNo || '';
                const mobileCode = (owner && owner.mobile) ? (owner.mobile || '').substring(0, 2) : '00';
                let customId = `${buildingCode}${wingCode}${flatCode}${mobileCode}`;
                // ensure uniqueness
                let uniqueCustomId = customId;
                let suffix = 1;
                while (await User.findOne({ customId: uniqueCustomId })) {
                    uniqueCustomId = `${customId}${suffix}`;
                    suffix++;
                }
                customId = uniqueCustomId;

                // split name
                let first = '';
                let last = '';
                if (m.name) {
                    const parts = m.name.trim().split(/\s+/);
                    first = parts[0] || '';
                    last = parts.slice(1).join(' ') || '';
                }

                // Ensure email is lowercase to match login queries
                const memberEmail = (m.email || '').toLowerCase();

                // Create a unique placeholder mobile so unique index doesn't clash
                const placeholderMobile = `fm_${customId}_${suffix}`;

                const newUserDoc = {
                    firstName: first || 'Member',
                    lastName: last || '',
                    mobile: placeholderMobile,
                    email: memberEmail,
                    password: owner.password, // copy hashed password
                    avatar: '',
                    phone: '',
                    address: '',
                    birthdate: null,
                    bio: '',
                    preferences: {},
                    roles: ['user'],
                    status: 'approved',
                    events: [],
                    customId,
                    buildingName: buildingName || owner.buildingName || '',
                    wing: wing || owner.wing || '',
                    flatNo: flatNo || owner.flatNo || '',
                    familyMembers: [],
                    residenceType: owner.residenceType || ''
                };

                // Insert directly to bypass pre-save hashing (we already copied hashed password)
                await User.collection.insertOne(newUserDoc);
                suffix++;

                // notify the member (without password)
                try {
                    await sendAccountCreatedNotice(m.email, m.name, customId, owner.email);
                } catch (err) {
                    console.error('Failed to send account notice to family member:', err);
                }
            }
        } catch (err) {
            console.error('Error creating family member accounts:', err);
        }

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
            const filename = `users_export_${new Date().toISOString().slice(0,10)}.csv`;
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

            try {
                // Remove any references to this user's email from other users' familyMembers arrays
                const deletedEmail = (deleted.email || '').toLowerCase();
                if (deletedEmail) {
                    await User.updateMany(
                        { 'familyMembers.email': { $regex: `^${deletedEmail}$`, $options: 'i' } },
                        { $pull: { familyMembers: { email: { $regex: `^${deletedEmail}$`, $options: 'i' } } } }
                    );
                }

                // Unset familyOf for any users who pointed to this user as owner
                await User.updateMany({ familyOf: deleted._id }, { $unset: { familyOf: '' } });

                // Delete placeholder family accounts that were generated for this user's customId
                const customId = deleted.customId;
                if (customId) {
                    await User.deleteMany({ mobile: { $regex: `^fm_${customId}`, $options: 'i' } });
                }
            } catch (cleanupErr) {
                console.error('Error during post-delete cleanup:', cleanupErr);
            }

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
            buildingName, wing, flatNo, dob, bio, residenceType
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
        let customId = `${buildingCode}${wingCode}${flatCode}${mobileCode}`;
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
            customId
        });
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        // Send credentials email to created user (non-blocking)
        try {
            const fullName = `${firstName} ${lastName}`;
            const { sendCredentialsEmail } = require('../config/mail');
            await sendCredentialsEmail(email, fullName, user.customId, password);
        } catch (emailError) {
            console.error('Failed to send credentials email to created user:', emailError);
        }

        res.status(201).json(userObj);
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