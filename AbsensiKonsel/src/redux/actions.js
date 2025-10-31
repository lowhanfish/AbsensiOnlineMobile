// redux/actions.js

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

export const loginSuccess = (token, profile) => ({
    type: LOGIN_SUCCESS,
    payload: {
        token,
        profile,
        unit_kerja: profile.unit_kerja || '',
        id_profile: profile.id_profile || '',
        nip: profile.nip || '',
    },
});

export const logout = () => ({
    type: LOGOUT,
});
