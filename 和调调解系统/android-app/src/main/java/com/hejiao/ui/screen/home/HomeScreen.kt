package com.hejiao.ui.screen.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.DashboardStats
import com.hejiao.data.api.model.Schedule
import com.hejiao.ui.component.CaseItem
import com.hejiao.ui.component.EmptyState
import com.hejiao.ui.component.StatCard
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.Dark
import com.hejiao.ui.theme.DarkSecondary
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.GoldDim
import com.hejiao.ui.theme.Rose
import com.hejiao.ui.theme.RoseDim
import com.hejiao.ui.theme.Teal
import com.hejiao.ui.theme.TealDim
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.theme.Violet
import com.hejiao.ui.theme.VioletDim
import com.hejiao.ui.viewModel.HomeViewModel
import java.util.Calendar

@Composable
fun HomeScreen(
    viewModel: HomeViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
    userName: String = "用户",
    onCaseClick: (Int) -> Unit = {},
    onQuickActionClick: (String) -> Unit = {},
    onViewAllCases: () -> Unit = {},
    onViewAllSchedules: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.loading && uiState.stats == null) {
        Box(
            modifier = Modifier.fillMaxSize().background(Background),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = Gold)
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Background),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item {
                GreetingHeader(userName)
                Spacer(modifier = Modifier.height(20.dp))
            }

            item {
                StatsSection(stats = uiState.stats, onStatClick = onCaseClick)
                Spacer(modifier = Modifier.height(20.dp))
            }

            item {
                QuickActionsSection(onActionClick = onQuickActionClick)
                Spacer(modifier = Modifier.height(20.dp))
            }

            item {
                RecentCasesSection(
                    cases = uiState.recentCases,
                    onViewAll = onViewAllCases,
                    onCaseClick = onCaseClick
                )
                Spacer(modifier = Modifier.height(20.dp))
            }

            item {
                TodaySchedulesSection(
                    schedules = uiState.todaySchedules,
                    onViewAll = onViewAllSchedules
                )
            }
        }
    }
}

@Composable
private fun GreetingHeader(userName: String) {
    val greeting = rememberGreeting()

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.verticalGradient(colors = listOf(Dark, DarkSecondary)))
            .padding(horizontal = 20.dp, vertical = 28.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = greeting,
                    fontSize = 16.sp,
                    color = Color.White.copy(alpha = 0.7f)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = userName,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(Gold),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (userName.isNotEmpty()) userName.first().toString() else "?",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
private fun rememberGreeting(): String {
    val calendar = Calendar.getInstance()
    val hour = calendar.get(Calendar.HOUR_OF_DAY)

    val greeting = when (hour) {
        in 0..11 -> "上午好"
        in 12..17 -> "下午好"
        else -> "晚上好"
    }

    return greeting
}

@Composable
private fun StatsSection(
    stats: DashboardStats?,
    onStatClick: (String) -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                label = "全部案件",
                value = stats?.total?.toString() ?: "0",
                icon = "⚖",
                color = Gold,
                bgColor = GoldDim,
                onClick = { onStatClick("all") },
                modifier = Modifier.weight(1f)
            )
            StatCard(
                label = "待处理",
                value = stats?.pending?.toString() ?: "0",
                icon = "📋",
                color = Color(0xFF60A5FA),
                bgColor = Color(0x1F60A5FA),
                onClick = { onStatClick("pending") },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                label = "调解中",
                value = stats?.mediating?.toString() ?: "0",
                icon = "💬",
                color = Teal,
                bgColor = TealDim,
                onClick = { onStatClick("mediating") },
                modifier = Modifier.weight(1f)
            )
            StatCard(
                label = "已结案",
                value = stats?.closed?.toString() ?: "0",
                icon = "✓",
                color = Violet,
                bgColor = VioletDim,
                onClick = { onStatClick("closed") },
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
private fun QuickActionsSection(onActionClick: (String) -> Unit) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            QuickActionItem(
                icon = "⚖",
                label = "案件管理",
                bgColor = GoldDim,
                textColor = Gold,
                onClick = { onActionClick("cases") }
            )
            QuickActionItem(
                icon = "📅",
                label = "日程安排",
                bgColor = TealDim,
                textColor = Teal,
                onClick = { onActionClick("schedules") }
            )
            QuickActionItem(
                icon = "📹",
                label = "视频调解",
                bgColor = VioletDim,
                textColor = Violet,
                onClick = { onActionClick("video") }
            )
            QuickActionItem(
                icon = "⭐",
                label = "调解评价",
                bgColor = RoseDim,
                textColor = Rose,
                onClick = { onActionClick("feedback") }
            )
        }
    }
}

@Composable
private fun QuickActionItem(
    icon: String,
    label: String,
    bgColor: Color,
    textColor: Color,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(bgColor),
            contentAlignment = Alignment.Center
        ) {
            Text(text = icon, fontSize = 26.sp)
        }
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun RecentCasesSection(
    cases: List<com.hejiao.data.api.model.Case>,
    onViewAll: () -> Unit,
    onCaseClick: (Int) -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        SectionHeader(title = "最近案件", onViewAll = onViewAll)

        if (cases.isEmpty()) {
            EmptyState(message = "暂无最近案件")
        } else {
            cases.forEach { case ->
                CaseItem(caseItem = case, onClick = { onCaseClick(case.id) })
            }
        }
    }
}

@Composable
private fun TodaySchedulesSection(
    schedules: List<Schedule>,
    onViewAll: () -> Unit
) {
    Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        SectionHeader(title = "今日日程", onViewAll = onViewAll)

        if (schedules.isEmpty()) {
            EmptyState(message = "今日暂无日程安排")
        } else {
            schedules.forEachIndexed { index, schedule ->
                ScheduleItem(schedule = schedule)
                if (index < schedules.lastIndex) {
                    HorizontalDivider(color = BorderLight)
                }
            }
        }
    }
}

@Composable
private fun SectionHeader(
    title: String,
    onViewAll: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "查看全部 ›",
            fontSize = 14.sp,
            color = Gold,
            modifier = Modifier.clickable(onClick = onViewAll)
        )
    }
}

@Composable
private fun ScheduleItem(schedule: Schedule) {
    val statusColor = when (schedule.status) {
        "pending" -> Gold
        "ongoing", "mediating" -> Teal
        else -> TextSecondary.copy(alpha = 0.5f)
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = {})
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(statusColor)
        )

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = schedule.title ?: "未命名日程",
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Row {
                Text(
                    text = "${schedule.startTime ?: ""} - ${schedule.endTime ?: ""}",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                if (!schedule.location.isNullOrBlank()) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "@ ${schedule.location}",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            }
        }
    }
}
