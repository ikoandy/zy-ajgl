package com.hejiao

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarToday
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.BottomNavigation
import androidx.compose.material3.BottomNavigationItem
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.navigation.NavHostController
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.hejiao.theme.BorderColor
import com.hejiao.theme.Gold
import com.hejiao.theme.TextSecondary
import com.hejiao.ui.navigation.HejiaoNavGraph
import com.hejiao.ui.theme.HejiaoTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            HejiaoTheme {
                val navController = rememberNavController()
                HejiaoMainScreen(navController = navController)
            }
        }
    }
}

@Composable
fun HejiaoMainScreen(navController: NavHostController) {
    val tabs = listOf(
        TabItem("home", "首页", Icons.Default.Home),
        TabItem("cases", "案件", Icons.Default.Description),
        TabItem("schedule", "日程", Icons.Default.CalendarToday),
        TabItem("profile", "我的", Icons.Default.Person)
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        bottomBar = {
            if (currentRoute in tabs.map { it.route }) {
                BottomNavigation(
                    modifier = Modifier.background(Color.White),
                    containerColor = Color.White,
                    contentColor = TextSecondary,
                    tonalElevation = 0.dp
                ) {
                    tabs.forEach { tab ->
                        BottomNavigationItem(
                            icon = {
                                Icon(
                                    imageVector = tab.icon,
                                    contentDescription = tab.label
                                )
                            },
                            label = { Text(tab.label) },
                            selected = currentRoute == tab.route,
                            onClick = {
                                if (currentRoute != tab.route) {
                                    navController.navigate(tab.route) {
                                        popUpTo(navController.graph.startDestinationId) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            selectedContentColor = Gold,
                            unselectedContentColor = TextSecondary
                        )
                    }
                }

                // 顶部分割线
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(BorderColor)
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            HejiaoNavGraph(navController = navController)
        }
    }
}

data class TabItem(
    val route: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)
