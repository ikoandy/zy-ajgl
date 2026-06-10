package com.hejiao.ui.screen.video

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectVerticalDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.VideoSession
import com.hejiao.ui.component.EmptyState
import com.hejiao.ui.component.FullScreenLoading
import com.hejiao.ui.component.StatusTag
import com.hejiao.ui.theme.Background
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.TextButton
import com.hejiao.ui.theme.BorderLight
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.GoldLight
import com.hejiao.ui.theme.Teal
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.theme.Violet
import com.hejiao.ui.viewModel.VideoForm
import com.hejiao.ui.viewModel.VideoViewModel
import kotlinx.coroutines.launch

@Composable
fun VideoScreen(
    viewModel: VideoViewModel = androidx.lifecycle.viewmodel.compose.viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()

    var pullOffsetY by remember { mutableFloatStateOf(0f) }
    val pullProgress by animateFloatAsState(
        targetValue = if (pullOffsetY > 0) (pullOffsetY / 120f).coerceIn(0f, 1f) else 0f,
        label = "pullProgress"
    )

    var showJoinDialog by remember { mutableStateOf(false) }
    var showConnectingToast by remember { mutableStateOf(false) }

    Box(modifier = Modifier.fillMaxSize().background(Background)) {
        Column(modifier = Modifier.fillMaxSize()) {
            Spacer(modifier = Modifier.height(8.dp))

            StatsHeader(stats = uiState.stats)

            Spacer(modifier = Modifier.height(12.dp))

            if (uiState.loading && uiState.sessions.isEmpty()) {
                FullScreenLoading()
            } else if (uiState.sessions.isEmpty()) {
                EmptyState(text = "暂无视频调解记录", icon = "📹")
            } else {
                VideoListContent(
                    sessions = uiState.sessions,
                    refreshing = uiState.refreshing,
                    pullProgress = pullProgress,
                    onPullStart = { offset -> pullOffsetY = offset },
                    onPullEnd = { pullOffsetY = 0f; viewModel.onRefresh() },
                    onEnterRoom = { showJoinDialog = true }
                )
            }
        }

        FloatingActionButton(
            onClick = { viewModel.showCreate() },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 24.dp)
        )

        if (uiState.showCreate) {
            CreateVideoBottomSheet(
                form = uiState.form,
                submitting = uiState.submitting,
                onFormChange = { field, value -> viewModel.onFormInput(field, value) },
                onDateChange = { viewModel.onDateChange(it) },
                onTimeChange = { viewModel.onTimeChange(it) },
                onSubmit = { viewModel.submitVideo() },
                onDismiss = { viewModel.hideCreate() }
            )
        }

        if (showJoinDialog) {
            AlertDialog(
                onDismissRequest = { showJoinDialog = false },
                title = { Text("进入视频调解") },
                text = { Text("确认进入视频调解房间？") },
                confirmButton = {
                    TextButton(onClick = {
                        showJoinDialog = false
                        showConnectingToast = true
                    }) {
                        Text("确认", color = Gold)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showJoinDialog = false }) {
                        Text("取消", color = TextSecondary)
                    }
                }
            )
        }

        if (showConnectingToast) {
            ConnectingToast(
                onDismiss = { showConnectingToast = false },
                modifier = Modifier.align(Alignment.Center)
            )
        }

        if (uiState.refreshing) {
            CircularProgressIndicator(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 80.dp)
                    .size(28.dp),
                color = Gold,
                strokeWidth = 2.5.dp
            )
        }
    }
}

@Composable
private fun StatsHeader(stats: Map<String, Int>) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground)
            .padding(horizontal = 16.dp, vertical = 18.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        StatColumn(
            count = stats["total"] ?: 0,
            label = "全部",
            color = Gold
        )
        StatColumn(
            count = stats["active"] ?: 0,
            label = "进行中",
            color = Teal
        )
        StatColumn(
            count = stats["completed"] ?: 0,
            label = "已完成",
            color = Violet
        )
    }
}

@Composable
private fun StatColumn(count: Int, label: String, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = count.toString(),
            fontSize = 40.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            color = TextSecondary
        )
    }
}

@Composable
private fun VideoListContent(
    sessions: List<VideoSession>,
    refreshing: Boolean,
    pullProgress: Float,
    onPullStart: (Float) -> Unit,
    onPullEnd: () -> Unit,
    onEnterRoom: (VideoSession) -> Unit
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .pointerInput(Unit) {
                detectVerticalDragGestures(onDragStart = {}, onDragEnd = { onPullEnd() }) { _, dragAmount ->
                    if (dragAmount > 0) {
                        onPullStart(dragAmount)
                    }
                }
            },
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        items(sessions, key = { it.id }) { session ->
            VideoSessionCard(session = session, onEnterRoom = { onEnterRoom(session) })
        }

        item {
            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun VideoSessionCard(session: VideoSession, onEnterRoom: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .padding(22.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            val statusColor = when (session.status) {
                "scheduled" -> Gold
                "in_progress" -> Teal
                else -> Color(0xFFD1D5DB)
            }
            val hasGlow = session.status == "scheduled" || session.status == "in_progress"

            Box(
                modifier = Modifier
                    .size(14.dp)
                    .then(
                        if (hasGlow) {
                            Modifier.shadow(8.dp, CircleShape, ambientColor = statusColor, spotColor = statusColor)
                        } else {
                            Modifier
                        }
                    )
                    .background(statusColor, CircleShape)
            )

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = session.title ?: "未命名调解",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f)
            )

            Spacer(modifier = Modifier.width(8.dp))

            StatusTag(status = session.status ?: "scheduled", text = VideoViewModel.statusMap[session.status])
        }

        Spacer(modifier = Modifier.height(10.dp))

        Column {
            Text(
                text = "案件：${session.caseNumber ?: "未关联"}",
                fontSize = 13.sp,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "时间：${formatScheduledAt(session.scheduledAt)}",
                fontSize = 13.sp,
                color = TextSecondary
            )
            if (session.duration != null && session.duration > 0) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "时长：${session.duration}分钟",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (session.status == "scheduled") {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .shadow(8.dp, RoundedCornerShape(8.dp))
                    .clip(RoundedCornerShape(8.dp))
                    .background(Brush.linearGradient(colors = listOf(Gold, GoldLight)))
                    .clickable(onClick = onEnterRoom),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "进入调解",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White,
                    letterSpacing = 2.sp
                )
            }
        } else {
            val statusText = VideoViewModel.statusMap[session.status] ?: session.status ?: "未知状态"
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFF3F4F6)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = statusText,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF9CA3AF)
                )
            }
        }
    }
}

@Composable
private fun FloatingActionButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .size(104.dp)
            .shadow(12.dp, CircleShape)
            .clip(CircleShape)
            .background(Brush.linearGradient(colors = listOf(Gold, GoldLight)))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = "+",
            fontSize = 48.sp,
            fontWeight = FontWeight.Light,
            color = Color.White
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateVideoBottomSheet(
    form: VideoForm,
    submitting: Boolean,
    onFormChange: (String, String) -> Unit,
    onDateChange: (String) -> Unit,
    onTimeChange: (String) -> Unit,
    onSubmit: () -> Unit,
    onDismiss: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.4f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.BottomCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                .background(CardBackground)
                .imePadding()
                .clickable(enabled = false) {}
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(40.dp)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(BorderLight)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "发起视频调解",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(20.dp))

            OutlinedTextField(
                value = form.title,
                onValueChange = { onFormChange("title", it) },
                label = { Text("如：张三与李四纠纷调解", fontSize = 14.sp) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold,
                    unfocusedBorderColor = BorderLight,
                    cursorColor = Gold
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedTextField(
                value = form.caseSearch,
                onValueChange = { onFormChange("caseSearch", it) },
                label = { Text("搜索案件编号或标题（可选）", fontSize = 14.sp) },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Gold,
                    unfocusedBorderColor = BorderLight,
                    cursorColor = Gold
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = form.date,
                    onValueChange = { onDateChange(it) },
                    label = { Text("日期", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Gold,
                        unfocusedBorderColor = BorderLight,
                        cursorColor = Gold
                    ),
                    modifier = Modifier.weight(1f)
                )

                OutlinedTextField(
                    value = form.time,
                    onValueChange = { onTimeChange(it) },
                    label = { Text("时间", fontSize = 13.sp) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Gold,
                        unfocusedBorderColor = BorderLight,
                        cursorColor = Gold
                    ),
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(64.dp)
                    .padding(horizontal = 20.dp)
                    .shadow(8.dp, RoundedCornerShape(12.dp))
                    .clip(RoundedCornerShape(12.dp))
                    .background(Brush.linearGradient(colors = listOf(Gold, GoldLight)))
                    .clickable(enabled = !submitting, onClick = onSubmit),
                contentAlignment = Alignment.Center
            ) {
                if (submitting) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(26.dp), strokeWidth = 2.5.dp)
                } else {
                    Text(
                        text = "创建视频调解",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun ConnectingToast(
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .shadow(16.dp, RoundedCornerShape(12.dp))
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF070B14).copy(alpha = 0.92f))
            .padding(horizontal = 32.dp, vertical = 20.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            CircularProgressIndicator(
                color = Gold,
                modifier = Modifier.size(20.dp),
                strokeWidth = 2.dp
            )
            Text(
                text = "正在连接...",
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium,
                color = Color.White
            )
        }
    }
}

private fun formatScheduledAt(scheduledAt: String?): String {
    if (scheduledAt.isNullOrBlank()) return "--"
    try {
        val inputFormat = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault())
        val date = inputFormat.parse(scheduledAt)
        if (date != null) {
            val outputFormat = java.text.SimpleDateFormat("yyyy年MM月dd日 HH:mm", java.util.Locale.getDefault())
            return outputFormat.format(date)
        }
    } catch (_: Exception) {}
    return scheduledAt
}
