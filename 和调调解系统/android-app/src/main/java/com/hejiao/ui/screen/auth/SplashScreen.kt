package com.hejiao.ui.screen.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LetterSpacing
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.prefs.TokenManager
import com.hejiao.ui.theme.Dark
import com.hejiao.ui.theme.Gold
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    tokenManager: TokenManager,
    onNavigateToMain: () -> Unit,
    onNavigateToLogin: () -> Unit
) {
    var hasNavigated by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        delay(1500)
        if (hasNavigated) return@LaunchedEffect

        var tokenExists = false
        tokenManager.getToken().collect { token ->
            tokenExists = !token.isNullOrEmpty()
        }

        hasNavigated = true
        if (tokenExists) {
            onNavigateToMain()
        } else {
            onNavigateToLogin()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Dark),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(128.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(Gold),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "⚖",
                    fontSize = 64.sp
                )
            }
            
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.size(32.dp))
            
            Text(
                text = "和调",
                fontSize = 56.sp,
                fontWeight = FontWeight.Bold,
                color = androidx.compose.ui.graphics.Color.White,
                letterSpacing = LetterSpacing(8.sp.value)
            )
            
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.size(16.dp))
            
            Text(
                text = "调解机构管理平台",
                fontSize = 26.sp,
                color = androidx.compose.ui.graphics.Color.White.copy(alpha = 0.45f)
            )
        }
    }
}
