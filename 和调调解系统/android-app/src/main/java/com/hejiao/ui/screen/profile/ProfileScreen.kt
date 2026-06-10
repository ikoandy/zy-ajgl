package com.hejiao.ui.screen.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LetterSpacing
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Dark
import com.hejiao.ui.theme.DarkSecondary
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.Rose
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.viewModel.ProfileViewModel
import android.widget.Toast

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel(),
    onLogout: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var showPasswordDialog by remember { mutableStateOf(false) }
    var showAboutDialog by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .verticalScroll(rememberScrollState())
    ) {
        // 用户信息卡片
        UserProfileCard(
            nameInitial = uiState.nameInitial,
            userName = uiState.userInfo?.real_name ?: uiState.userInfo?.username ?: "用户",
            roleDisplay = uiState.roleDisplay
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 功能菜单列表
        MenuSection(
            onSettingsClick = {
                Toast.makeText(context, "PC端管理", Toast.LENGTH_SHORT).show()
            },
            onPasswordClick = { showPasswordDialog = true },
            onAboutClick = { showAboutDialog = true }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 统计区
        StatsSection(stats = uiState.stats)

        Spacer(modifier = Modifier.height(24.dp))

        // 退出登录按钮
        LogoutButton(onClick = { showLogoutConfirm = true })

        // 版本信息
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 24.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "和调 · 调解机构管理平台 v1.0.0",
                fontSize = 11.sp,
                color = TextSecondary.copy(alpha = 0.6f)
            )
        }

        Spacer(modifier = Modifier.height(32.dp))
    }

    if (showPasswordDialog) {
        AlertDialog(
            onDismissRequest = { showPasswordDialog = false },
            title = { Text("修改密码") },
            text = { Text("请前往PC端修改密码，移动端暂不支持此功能。") },
            confirmButton = {
                TextButton(onClick = { showPasswordDialog = false }) {
                    Text("我知道了")
                }
            }
        )
    }

    if (showAboutDialog) {
        AlertDialog(
            onDismissRequest = { showAboutDialog = false },
            title = { Text("关于系统") },
            text = {
                Text(
                    "和调 · 调解机构管理平台\n" +
                            "版本：v1.0.0\n" +
                            "平台：Android APP\n" +
                            "后端：Node.js + SQLite\n\n" +
                            "和调，让调解更高效。"
                )
            },
            confirmButton = {
                TextButton(onClick = { showAboutDialog = false }) {
                    Text("确定")
                }
            }
        )
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("确认退出") },
            text = { Text("退出登录后将无法使用系统功能") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLogoutConfirm = false
                        viewModel.doLogout(onLogout)
                    }
                ) {
                    Text("确认退出", color = Rose)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
                    Text("取消")
                }
            }
        )
    }
}

@Composable
private fun UserProfileCard(
    nameInitial: String,
    userName: String,
    roleDisplay: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.verticalGradient(colors = listOf(Dark, DarkSecondary)))
            .padding(vertical = 40.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(128.dp)
                    .clip(CircleShape)
                    .background(Gold)
                    .padding(4.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                        .background(Color.White.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = nameInitial,
                        fontSize = 44.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = userName,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = roleDisplay,
                fontSize = 13.sp,
                color = Color.White.copy(alpha = 0.45f)
            )
        }
    }
}

@Composable
private fun MenuSection(
    onSettingsClick: () -> Unit,
    onPasswordClick: () -> Unit,
    onAboutClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .padding(horizontal = 32.dp)
            .shadow(elevation = 2.dp, shape = RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
    ) {
        MenuItemRow(icon = "⚙", title = "系统设置", onClick = onSettingsClick, showDivider = true)
        MenuItemRow(icon = "🔑", title = "修改密码", onClick = onPasswordClick, showDivider = true)
        MenuItemRow(icon = "ℹ", title = "关于系统", onClick = onAboutClick, showDivider = false)
    }
}

@Composable
private fun MenuItemRow(
    icon: String,
    title: String,
    onClick: () -> Unit,
    showDivider: Boolean
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(horizontal = 24.dp, vertical = 18.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = icon, fontSize = 20.sp)
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = title,
                fontSize = 16.sp,
                color = com.hejiao.ui.theme.TextPrimary,
                fontWeight = FontWeight.Medium
            )
        }
        if (showDivider) {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = 24.dp),
                color = com.hejiao.ui.theme.BorderColor
            )
        }
    }
}

@Composable
private fun StatsSection(stats: Map<String, Int>) {
    Row(
        modifier = Modifier
            .padding(horizontal = 32.dp)
            .fillMaxWidth()
            .shadow(elevation = 1.dp, shape = RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .padding(vertical = 28.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        StatItem(label = "经手案件", value = stats["cases"]?.toString() ?: "0")
        StatItem(label = "日程安排", value = stats["schedules"]?.toString() ?: "0")
        StatItem(label = "视频调解", value = stats["videos"]?.toString() ?: "0")
    }
}

@Composable
private fun RowScope.StatItem(label: String, value: String) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.weight(1f)
    ) {
        Text(
            text = value,
            fontSize = 34.sp,
            fontWeight = FontWeight.Bold,
            color = Gold
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 13.sp,
            color = TextSecondary
        )
    }
}

@Composable
private fun LogoutButton(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .padding(horizontal = 32.dp)
            .fillMaxWidth()
            .height(80.dp)
            .clip(RoundedCornerShape(12.dp))
            .background(Color.Transparent)
            .border(
                border = BorderStroke(2.dp, Rose.copy(alpha = 0.3f)),
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "退出登录",
            fontSize = 17.sp,
            color = Rose,
            fontWeight = FontWeight.Medium,
            letterSpacing = 2.sp
        )
    }
}
