// redux/actions.js (Perlu Ditambahkan/Diperbarui)

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';
export const SET_WAKTU_DATA = 'SET_WAKTU_DATA'; 


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


export const setWaktuData = (newWaktuData) => ({
    type: SET_WAKTU_DATA,
    payload: newWaktuData,
});