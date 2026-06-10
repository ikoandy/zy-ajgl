package com.hejiao.di.api

import com.hejiao.data.prefs.TokenManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // 获取Token并添加到请求头
        val token = runBlocking {
            tokenManager.getToken().first()
        }

        val authenticatedRequest = if (!token.isNullOrEmpty()) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $token")
                .build()
        } else {
            originalRequest
        }

        val response = chain.proceed(authenticatedRequest)

        // 如果返回401，清除本地Token（需要跳转登录页面的逻辑在Repository层处理）
        if (response.code == 401) {
            runBlocking {
                tokenManager.clearToken()
            }
        }

        return response
    }
}
