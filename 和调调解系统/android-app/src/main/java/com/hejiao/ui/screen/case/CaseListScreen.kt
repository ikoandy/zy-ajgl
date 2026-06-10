package com.hejiao.ui.screen.case

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hejiao.data.api.model.Case
import com.hejiao.ui.component.EmptyState
import com.hejiao.ui.component.FilterTabRow
import com.hejiao.ui.component.HejiaoTopAppBar
import com.hejiao.ui.component.SearchBar
import com.hejiao.ui.component.StatusTag
import com.hejiao.ui.theme.Background
import com.hejiao.ui.theme.CardBackground
import com.hejiao.ui.theme.Gold
import com.hejiao.ui.theme.Rose
import com.hejiao.ui.theme.TextPrimary
import com.hejiao.ui.theme.TextSecondary
import com.hejiao.ui.viewModel.CaseListViewModel
import androidx.hilt.navigation.compose.hiltViewModel
import kotlinx.coroutines.delay

@Composable
fun CaseListScreen(
    viewModel: CaseListViewModel = hiltViewModel(),
    onCaseClick: (Int) -> Unit = {}
) {
    val uiState by remember { viewModel.uiState }
    var keyword by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
    ) {
        HejiaoTopAppBar(title = "案件管理")

        Spacer(modifier = Modifier.height(12.dp))

        SearchBar(
            keyword = keyword,
            hint = "搜索案件编号、标题...",
            onValueChange = { keyword = it },
            onSearch = { viewModel.onSearch(keyword) }
        )

        Spacer(modifier = Modifier.height(8.dp))

        FilterTabRow(
            items = viewModel.statusFilters,
            selectedKey = uiState.activeStatus,
            onSelect = { status -> viewModel.filterByStatus(status) }
        )

        Spacer(modifier = Modifier.height(8.dp))

        if (uiState.loading && uiState.cases.isEmpty()) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Gold)
            }
        } else if (uiState.cases.isEmpty() && !uiState.loading) {
            EmptyState(text = "暂无案件数据", icon = "📋")
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                IconButton(onClick = { viewModel.loadCases(reset = true) }) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "刷新",
                        tint = TextSecondary
                    )
                }
            }
        } else {
            val listState = rememberLazyListState()
            val shouldLoadMore by remember {
                derivedStateOf {
                    val lastVisibleItem = listState.layoutInfo.visibleItemsInfo.lastOrNull()
                    lastVisibleItem != null && lastVisibleItem.index >= uiState.cases.size - 2
                }
            }

            LaunchedEffect(shouldLoadMore) {
                if (shouldLoadMore && uiState.hasMore && !uiState.loading) {
                    viewModel.loadMore()
                }
            }

            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(uiState.cases, key = { it.id }) { case ->
                    CaseCard(case = case, onClick = { onCaseClick(case.id) })
                }

                item {
                    if (uiState.hasMore && uiState.loading) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                CircularProgressIndicator(
                                    color = Gold,
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "加载中...",
                                    fontSize = 13.sp,
                                    color = TextSecondary
                                )
                            }
                        }
                    } else if (!uiState.hasMore) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "-- 已全部加载 --",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CaseCard(
    case: Case,
    onClick: () -> Unit
) {
    val priorityColor = when (case.priority?.lowercase()) {
        "urgent" -> Rose
        "high" -> Color(0xFFFF9500)
        "low" -> Color(0xFF8E8E93)
        else -> Color(0xFF34C759)
    }

    androidx.compose.foundation.clickable(onClick = onClick)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(CardBackground)
            .clip(RoundedCornerShape(12.dp))
            .then(
                if (androidx.compose.foundation.interaction.MutableInteractionSource() != null) {
                    Modifier
                } else {
                    Modifier
                }
            )
            .padding(20.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = case.caseNumber ?: "--",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Gold
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    StatusTag(status = case.status ?: "")
                }

                Box(
                    modifier = Modifier
                        .size(10.dp)
                        .clip(RoundedCornerShape(5.dp))
                        .background(priorityColor)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = case.title ?: "",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = case.typeName ?: "未分类",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Text(
                    text = " · ",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Text(
                    text = case.createdAt ?: "",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
            }
        }
    }
}
