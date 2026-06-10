package com.hejiao.ui.screen.case

import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.CaseParty
import com.hejiao.data.api.model.WorkflowLog
import com.hejiao.ui.component.StatusTag
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Dark
import com.hejiao.ui.theme.DarkSecondary
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.Rose
import com.hejiao.ui.theme.Teal
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.theme.TextMuted
import com.hejiao.ui.theme.Violet
import com.hejiao.ui.viewModel.CaseDetailViewModel
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CaseDetailScreen(
    caseId: Int,
    viewModel: CaseDetailViewModel = hiltViewModel(),
    onNavigateBack: () -> Unit = {}
) {
    val uiState by remember { viewModel.uiState }
    val context = LocalContext.current
    var showTransitionDialog by remember { mutableStateOf(false) }
    var showPartiesSection by remember { mutableStateOf(true) }
    var showTimelineSection by remember { mutableStateOf(true) }

    LaunchedEffect(caseId) {
        viewModel.loadDetail(caseId)
    }

    Scaffold(
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Brush.verticalGradient(colors = listOf(Dark, DarkSecondary)))
                    .padding(horizontal = 8.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "返回",
                        tint = Color.White
                    )
                }
                Text(
                    text = "案件详情",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(start = 4.dp)
                )
            }
        }
    ) { paddingValues ->
        if (uiState.loading && uiState.caseData == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Gold)
            }
        } else if (uiState.caseData != null) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(Background)
            ) {
                item {
                    HeaderSection(uiState.caseData!!)
                }

                item {
                    ActionButtonsRow(
                        onTransitionClick = { showTransitionDialog = true },
                        onPartiesClick = { showPartiesSection = !showPartiesSection },
                        onTimelineClick = { showTimelineSection = !showTimelineSection }
                    )
                }

                item {
                    BasicInfoSection(uiState.caseData!!, viewModel)
                }

                if (!uiState.caseData!!.description.isNullOrBlank()) {
                    item {
                        DescriptionSection(description = uiState.caseData!!.description!!)
                    }
                }

                if (uiState.parties.isNotEmpty() && showPartiesSection) {
                    item {
                        PartiesSection(parties = uiState.parties, roleMap = viewModel.roleMap, context = context)
                    }
                }

                if (uiState.timeline.isNotEmpty() && showTimelineSection) {
                    item {
                        TimelineSection(timeline = uiState.timeline)
                    }
                }
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(text = "📋", fontSize = 48.sp, color = TextMuted)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = uiState.error ?: "加载失败",
                        color = TextSecondary,
                        fontSize = 14.sp
                    )
                }
            }
        }
    }

    if (showTransitionDialog) {
        TransitionDialog(
            options = viewModel.transitionOptions,
            onSelect = { status ->
                showTransitionDialog = false
                viewModel.transition(caseId, status)
            },
            onDismiss = { showTransitionDialog = false }
        )
    }
}

@Composable
private fun HeaderSection(case: com.hejiao.data.api.model.Case) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.verticalGradient(colors = listOf(Dark, DarkSecondary)))
            .padding(24.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = case.caseNumber ?: "--",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Gold
                )
                Spacer(modifier = Modifier.width(10.dp))
                StatusTag(status = case.status ?: "")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            text = case.title ?: "",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = case.typeName ?: "未分类",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.45f)
            )
            Text(
                text = " · ",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.45f)
            )
            Text(
                text = case.createdAt ?: "",
                fontSize = 14.sp,
                color = Color.White.copy(alpha = 0.45f)
            )
        }
    }
}

@Composable
private fun ActionButtonsRow(
    onTransitionClick: () -> Unit,
    onPartiesClick: () -> Unit,
    onTimelineClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        ActionButton(icon = "🔄", label = "状态流转", onClick = onTransitionClick)
        ActionButton(icon = "👥", label = "当事人", onClick = onPartiesClick)
        ActionButton(icon = "📋", label = "时间线", onClick = onTimelineClick)
    }
}

@Composable
private fun ActionButton(icon: String, label: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.clickable(onClick = onClick)
    ) {
        Text(text = icon, fontSize = 24.sp)
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            fontSize = 12.sp,
            color = TextSecondary,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun BasicInfoSection(
    case: com.hejiao.data.api.model.Case,
    viewModel: CaseDetailViewModel
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 16.dp)
    ) {
        Text(
            text = "基本信息",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        androidx.compose.foundation.layout.GridLayout(columns = 2) {
            InfoCard(label = "案件类型", value = case.typeName ?: "--")
            InfoCard(label = "优先级", value = viewModel.priorityMap[case.priority] ?: case.priority ?: "--")
            InfoCard(label = "调解员", value = case.mediatorName ?: "--")
            InfoCard(label = "当前阶段", value = when (case.status?.lowercase()) {
                "pending" -> "待受理"
                "accepted" -> "已受理"
                "mediating" -> "调解中"
                "agreed" -> "已协议"
                "terminated" -> "已终止"
                "closed" -> "已结案"
                else -> case.status ?: "--"
            })
        }
    }
}

@Composable
private fun InfoCard(label: String, value: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .background(CardBackground)
            .padding(16.dp)
    ) {
        Column {
            Text(
                text = label,
                fontSize = 12.sp,
                color = TextMuted,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = value,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        }
    }
}

@Composable
private fun DescriptionSection(description: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp)
    ) {
        Text(
            text = "案件描述",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(8.dp))
                .background(CardBackground)
                .padding(16.dp)
        ) {
            Text(
                text = description,
                fontSize = 14.sp,
                color = TextSecondary,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun PartiesSection(
    parties: List<CaseParty>,
    roleMap: Map<String, String>,
    context: android.content.Context
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp)
    ) {
        Text(
            text = "当事人(${parties.size})",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 12.dp)
        )

        parties.forEachIndexed { index, party ->
            PartyCard(party = party, roleMap = roleMap, context = context)
            if (index < parties.lastIndex) {
                Spacer(modifier = Modifier.height(10.dp))
            }
        }
    }
}

@Composable
private fun PartyCard(
    party: CaseParty,
    roleMap: Map<String, String>,
    context: android.content.Context
) {
    val avatarColor = when (party.role.lowercase()) {
        "plaintiff" -> Gold
        "defendant" -> Teal
        else -> Violet
    }
    val initial = party.name?.firstOrNull()?.uppercase() ?: "?"

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(avatarColor.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = initial,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = avatarColor
            )
        }

        Spacer(modifier = Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = party.name ?: "--",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(avatarColor.copy(alpha = 0.1f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = roleMap[party.role] ?: party.role,
                        fontSize = 11.sp,
                        color = avatarColor,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            if (!party.phone.isNullOrBlank()) {
                Text(
                    text = party.phone!!,
                    fontSize = 13.sp,
                    color = Teal,
                    modifier = Modifier.clickable {
                        val intent = Intent(Intent.ACTION_DIAL).apply {
                            data = Uri.parse("tel:${party.phone}")
                        }
                        context.startActivity(intent)
                    }
                )
            }
        }
    }
}

@Composable
private fun TimelineSection(timeline: List<WorkflowLog>) {
    val timelineColors = listOf(Gold, Teal, Violet, Rose, Color(0xFF60A5FA), Color(0xFF34D399))

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp)
            .padding(top = 20.dp, bottom = 24.dp)
    ) {
        Text(
            text = "案件时间线",
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        timeline.forEachIndexed { index, log ->
            TimelineItem(
                log = log,
                dotColor = timelineColors[index % timelineColors.size],
                isLast = index == timeline.lastIndex
            )
        }
    }
}

@Composable
private fun TimelineItem(log: WorkflowLog, dotColor: Color, isLast: Boolean) {
    Row(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.width(24.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(14.dp)
                    .clip(CircleShape)
                    .background(dotColor)
            )
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(40.dp)
                        .background(dotColor.copy(alpha = 0.3f))
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(8.dp))
                .background(CardBackground)
                .padding(14.dp)
        ) {
            Column {
                Text(
                    text = log.action ?: log.content ?: "--",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = TextPrimary
                )
                if (!log.userName.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = log.userName!!,
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
                if (!log.createdAt.isNullOrBlank()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = log.createdAt!!,
                        fontSize = 11.sp,
                        color = TextSecondary
                    )
                }
            }
        }
    }

    if (!isLast) {
        Spacer(modifier = Modifier.height(12.dp))
    }
}

@Composable
private fun TransitionDialog(
    options: List<Pair<String, String>>,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "状态流转",
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column {
                options.forEach { (key, label) ->
                    Text(
                        text = label,
                        fontSize = 15.sp,
                        color = TextPrimary,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onSelect(key) }
                            .padding(vertical = 14.dp, horizontal = 8.dp)
                    )
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消", color = TextSecondary)
            }
        }
    )
}
