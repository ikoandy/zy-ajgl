package com.hejiao.data.prefs

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.tokenDataStore: DataStore<Preferences> by preferencesDataStore(
    name = "token_prefs"
)

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val KEY_TOKEN = "auth_token"
    }

    private val tokenKey = stringPreferencesKey(KEY_TOKEN)

    suspend fun saveToken(token: String) {
        context.tokenDataStore.edit { preferences ->
            preferences[tokenKey] = token
        }
    }

    fun getToken(): Flow<String?> {
        return context.tokenDataStore.data.map { preferences ->
            preferences[tokenKey]
        }
    }

    suspend fun clearToken() {
        context.tokenDataStore.edit { preferences ->
            preferences.remove(tokenKey)
        }
    }

    suspend fun hasToken(): Boolean {
        var result = false
        getToken().collect { token ->
            result = !token.isNullOrEmpty()
        }
        return result
    }
}
