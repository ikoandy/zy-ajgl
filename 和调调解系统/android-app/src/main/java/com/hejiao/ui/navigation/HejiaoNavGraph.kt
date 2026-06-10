package com.hejiao.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.hejiao.ui.screen.auth.LoginScreen
import com.hejiao.ui.screen.case.CaseDetailScreen
import com.hejiao.ui.screen.case.CaseListScreen
import com.hejiao.ui.screen.feedback.FeedbackScreen
import com.hejiao.ui.screen.home.HomeScreen
import com.hejiao.ui.screen.profile.ProfileScreen
import com.hejiao.ui.screen.schedule.ScheduleScreen
import com.hejiao.ui.screen.video.VideoScreen

@Composable
fun HejiaoNavGraph(navController: NavHostController) {
    val nav = navController

    NavHost(navController = nav, startDestination = "home") {
        // 主Tab页面
        com<String>("home") {
            HomeScreen(
                onCaseClick = { id -> nav.navigate("case_detail/$id") }
            )
        }
        com<String>("cases") {
            CaseListScreen(onCaseClick = { id -> nav.navigate("case_detail/$id") })
        }
        com<String>(
            route = "case_detail/{caseId}",
            arguments = listOf(navArgument("caseId") { type = NavType.IntType })
        ) {
            val caseId = it.arguments?.getString("caseId")?.toIntOrNull() ?: return@com
            CaseDetailScreen(
                caseId = caseId,
                onBack = { nav.popBackStack() }
            )
        }
        com<String>("schedule") {
            ScheduleScreen()
        }
        com<String>("video") {
            VideoScreen()
        }
        com<String>("feedback") {
            FeedbackScreen()
        }
        com<String>("profile") {
            ProfileScreen(onLogout = {
                nav.navigate("login") {
                    popUpTo("home") { inclusive = true }
                }
            })
        }

        // 认证页面（不在Tab中）
        com<String>("login") {
            LoginScreen(onLoginSuccess = {
                nav.navigate("home") {
                    popUpTo("login") { inclusive = true }
                }
            })
        }
    }
}
