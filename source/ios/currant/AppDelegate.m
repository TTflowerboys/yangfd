//
//  AppDelegate.m
//  currant
//
//  Created by Foster Yin on 3/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "AppDelegate.h"
#import "CUTEWebViewController.h"
#import "CUTEPropertyListViewController.h"
#import "CUTERentListViewController.h"
#import "CUTERentTypeListViewController.h"
#import "CUTEDataManager.h"
#import "CUTEConfiguration.h"
#import <UIImage+Resize.h>
#import "NSURL+CUTE.h"
#import "CUTEUIMacro.h"
#import "CUTECommonMacro.h"
#import "CUTEAPICacheManager.h"
#import "CUTERentTypeListForm.h"
#import <AFNetworkActivityIndicatorManager.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEShareManager.h"
#import "CUTENotificationKey.h"
#import "CUTETicket.h"
#import "CUTERentShareViewController.h"
#import "CUTERentShareForm.h"
#import "CUTEUnfinishedRentTicketListViewController.h"
#import "CUTERentTicketPublisher.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEImageUploader.h"
#import "CUTETracker.h"
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import <Bugtags/Bugtags.h>
#import <ATConnect.h>
#import <JDFTooltips.h>
#import <ALActionBlocks.h>
#ifdef DEBUG
#import <AFNetworkActivityLogger.h>
#endif
#import "CUTESplashViewController.h"
#import "CUTEUserDefaultKey.h"
#import "MemoryReporter.h"
#import "UITabBarController+HideTabBar.h"
#import "Sequencer.h"
#import "CUTETooltipView.h"
#import "NSArray+ObjectiveSugar.h"
#import "Aspects.h"
#import "CUTEUserAgentUtil.h"
#import "CUTESurveyHelper.h"
#import "CUTEUsageRecorder.h"
#import "CUTEApptentiveEvent.h"
#import "CUTERentConfirmPhoneViewController.h"
#import "CUTERentConfirmPhoneForm.h"
#import "CUTEAPIManager.h"
#import <BBTAppUpdater.h>
#import "CUTEWebArchiveManager.h"
#import "CUTEWebConfiguration.h"
#import "CUTESettingViewController.h"
#import <GGLContext.h>
#import <UIAlertView+Blocks.h>
#import "CUTELocalizationSwitcher.h"
#import <NSArray+ObjectiveSugar.h>
#import "currant-Swift.h"
#import <Base64.h>
//#import <JPEngine.h>

@interface AppDelegate () <UITabBarControllerDelegate>
{
    NSInteger _lastSelectedTabIndex;

    BFTask *_reloadPublishRentTicketTabTask;
}

@property (nonatomic, strong) UITabBarController *tabBarController;

@end

@implementation AppDelegate


#define kHomeTabBarIndex 0
#define kPropertyListTabBarIndex 1
#define kEditTabBarIndex 2
#define kRentTicketListTabBarIndex 3
#define kUserTabBarIndex 4

- (UINavigationController *)getTabBarNavigationControllerWithIndex:(NSInteger)index {
    NSString *title = [self tabbarTitles][index];
    NSString *icon = [self tabbarIcons][index];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    nav.tabBarItem = tabItem;
    nav.tabBarItem.tag = index;
    nav.tabBarItem.accessibilityLabel = title;
    nav.view.backgroundColor = CUTE_BACKGROUND_COLOR;
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    nav.navigationItem.title = STR(@"AppDelegate/洋房东");
    return nav;

}

- (UINavigationController *)makeEditViewController{
    NSInteger index = kEditTabBarIndex;
    NSString *title = [self tabbarTitles][index];
    NSString *icon = [self tabbarIcons][index];
    UINavigationController *nav = [[UINavigationController alloc] init];
    nav.view.backgroundColor = CUTE_BACKGROUND_COLOR;
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:nil];
    tabItem.tag = index;
    nav.tabBarItem = tabItem;
    nav.tabBarItem.accessibilityLabel = title;

    [nav.tabBarItem setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]} forState:UIControlStateNormal];
    [nav.tabBarItem setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]} forState:UIControlStateSelected];
    nav.title = STR(@"AppDelegate/出租发布");
    nav.tabBarItem.accessibilityLabel = nav.title;
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    return nav;
}

- (NSArray *)tabbarTitles {
    return @[STR(@"AppDelegate/主页"),
             STR(@"AppDelegate/新房"),
             STR(@"AppDelegate/发布"),
             STR(@"AppDelegate/租房"),
             STR(@"AppDelegate/我")
             ];
}

- (NSArray *)tabbarIcons {
    return @[@"tab-home",
             @"tab-property",
             @"tab-edit",
             @"tab-rent",
             @"tab-user"
             ];
}

- (NSURL *)tabbarURLWithIndex:(NSUInteger)index {

    NSArray *array = @[@"/",
                       @"/property-list",
                       @"/property-to-rent/create",
                       @"/property-to-rent-list",
                       @"/user"];

    NSURL *URL = [CUTEPermissionChecker URLWithPath:array[index]];
    return URL;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {

//    [JPEngine startEngine];
//    [JPEngine evaluateScriptWithPath:[[NSBundle mainBundle] pathForResource:@"JSPatchTest" ofType:@"jspatch"]];

    [CUTEPatcher patch];
    [[AFNetworkActivityIndicatorManager sharedManager] setEnabled:YES];
    [CUTEUserAgentUtil setupWebViewUserAgent];
    [self checkSetupLanguageNeedShowAlert:NO];
    [[CUTEShareManager sharedInstance] setUpShareSDK];
    [ATConnect sharedConnection].appID = [CUTEConfiguration appStoreId];
    [ATConnect sharedConnection].apiKey = @"870539ce7c8666f4ba6440cae368b8aea448aa2220dc3af73bc254f0ab2f0a0b";

    // Configure tracker from GoogleService-Info.plist.
    NSError *configureError;
    [[GGLContext sharedInstance] configureWithError:&configureError];
    NSAssert(!configureError, @"Error configuring Google services: %@", configureError);
    [[CUTETracker sharedInstance] setup];


    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketPublish:) name:KNOTIF_TICKET_PUBLISH object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketWechatShare:) name:KNOTIF_TICKET_WECHAT_SHARE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketListReload:) name:KNOTIF_TICKET_LIST_RELOAD object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceivePropertyShare:) name:KNOTIF_PROPERTY_SHARE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveHideRootTabBar:) name:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveShowRootTabBar:) name:KNOTIF_SHOW_ROOT_TAB_BAR object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogin:) name:KNOTIF_USER_DID_LOGIN object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogout:) name:KNOTIF_USER_DID_LOGOUT object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserVerifyPhone:) name:KNOTIF_USER_VERIFY_PHONE object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveMarkUserAsLandlord:) name:KNOTIF_MARK_USER_AS_LANDLORD object:nil];

    [NotificationCenter addObserver:self selector:@selector(onReceiveShowHomeTab:) name:KNOTIF_SHOW_HOME_TAB object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveShowSplashView:) name:KNOTIF_SHOW_SPLASH_VIEW object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveLocalizationDidUpdate:) name:CUTELocalizationDidUpdateNotification object:nil];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    UINavigationController *homeViewController = [self getTabBarNavigationControllerWithIndex:kHomeTabBarIndex];

    UINavigationController *editViewController =  [self makeEditViewController];
    UINavigationController *propertyListViewController = [self getTabBarNavigationControllerWithIndex:kPropertyListTabBarIndex];
    UINavigationController *rentTicketListViewController = [self getTabBarNavigationControllerWithIndex:kRentTicketListTabBarIndex];
    UINavigationController *userViewController = [self getTabBarNavigationControllerWithIndex:kUserTabBarIndex];

    [rootViewController setViewControllers:@[homeViewController,
                                             propertyListViewController,
                                             editViewController,
                                             rentTicketListViewController,
                                             userViewController] animated:NO];

    [self.window setRootViewController:rootViewController];
    self.tabBarController = rootViewController;
    rootViewController.delegate = self;
    [rootViewController.tabBar setBackgroundImage:[IMAGE(@"tabbar-background") resizedImage:CGSizeMake([UIScreen mainScreen].bounds.size.width, rootViewController.tabBar.frame.size.height) interpolationQuality:kCGInterpolationHigh]];
    // this will generate a black tab bar
    //http://stackoverflow.com/questions/18734794/how-can-i-change-the-text-and-icon-colors-for-tabbaritems-in-ios-7
    rootViewController.tabBar.barTintColor = CUTE_BAR_COLOR;


    // this will give selected icons and text your apps tint color
    //rootViewController.tabBar.tintColor = HEXCOLOR(0x7a7a7a, 1);  // appTintColor is a UIColor *
    [[UINavigationBar appearance] setBarTintColor:CUTE_BAR_COLOR];
    [[UINavigationBar appearance] setTintColor:CUTE_MAIN_COLOR];
    [[UINavigationBar appearance] setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]}];
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : HEXCOLOR(0x7a7a7a, 1)} forState:UIControlStateSelected];

    // doing this results in an easier to read unselected state then the default iOS 7 one
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : [UIColor colorWithRed:.5 green:.5 blue:.5 alpha:1]
                                                        } forState:UIControlStateNormal];
    [self.window makeKeyAndVisible];

    [[CUTEAPICacheManager sharedInstance] refresh];

    _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:YES];

    _lastSelectedTabIndex = -1; // default a invalid value
    //defautl open home page
    [self.tabBarController setSelectedIndex:kHomeTabBarIndex];
    [self updateWebViewControllerTabAtIndex:kHomeTabBarIndex];
    _lastSelectedTabIndex = kHomeTabBarIndex;

    //TOOD 可以考虑第一次进来，加载 app 所有的 tab 需要的网页 archive 和 enums ，但是不去渲染 tab 里面的 view controller

//#warning DEBUG_CODE
#ifdef DEBUG

//    [CrashlyticsKit crash];
//    [NSClassFromString(@"WebView") performSelector:NSSelectorFromString(@"_enableRemoteInspector")];
//    [[AFNetworkActivityLogger sharedLogger] setLevel:AFLoggerLevelInfo];
//    [[AFNetworkActivityLogger sharedLogger] startLogging];
#endif

    NSDictionary *appInfo = [[NSBundle mainBundle] infoDictionary];
    if ([[appInfo objectForKey:@"CurrantChannel"] isEqualToString:@"production"]) {
        [Fabric with:@[CrashlyticsKit]];
    }
    else {
        //TODO check production need this feature and this lib?
        [Bugtags startWithAppKey:@"fb5ae938402722929e9bd6bc21239141" invocationEvent:BTGInvocationEventBubble];
    }

    [[CUTETracker sharedInstance] trackEnterForeground];


    //wait for the register controller dismiss, in case of mis-order trigger viewWillDisappear
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [self checkShowPublishRentTicketTooltip];
    });

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [[ATConnect sharedConnection] engage:APPTENTIVE_EVENT_APP_LAUNCH fromViewController:self.tabBarController];
        [CUTESurveyHelper checkShowPublishedRentTicketSurveyWithViewController:self.tabBarController];
    });

    [self checkAppUpdate];

    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    [[CUTEDataManager sharedInstance] persistAllCookies];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.

    [[CUTETracker sharedInstance] trackEnterForeground];

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        [CUTESurveyHelper checkShowPublishedRentTicketSurveyWithViewController:self.tabBarController];
    });
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [[CUTEDataManager sharedInstance] restoreAllCookies];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication
         annotation:(id)annotation
{
    return [[CUTEShareManager sharedInstance] handleOpenURL:url
                 sourceApplication:sourceApplication
                        annotation:annotation];
}

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    [[CUTETracker sharedInstance] trackMemoryWarning];
}

- (BOOL)checkShowSplashViewController {
    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_SPLASH_DISPLAYED])
    {
        CUTESplashViewController *spalshViewController = [CUTESplashViewController new];
        [self.tabBarController presentViewController:spalshViewController animated:NO completion:nil];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_SPLASH_DISPLAYED];
        [[NSUserDefaults standardUserDefaults] synchronize];
        return YES;
    }
    else {
        return NO;
    }
}

- (void)checkShowPublishRentTicketTooltip {

    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_TIP_PUBLISH_RENT_DISPLAYED]) {
        CUTETooltipView *toolTips = [[CUTETooltipView alloc] initWithTargetPoint:CGPointMake(ScreenWidth / 2, ScreenHeight - TabBarHeight - 5) hostView:self.tabBarController.view tooltipText:STR(@"AppDelegate/发布租房") arrowDirection:JDFTooltipViewArrowDirectionDown width:90];
        [toolTips show];

        [self.window aspect_hookSelector:@selector(hitTest:withEvent:) withOptions:AspectPositionBefore | AspectOptionAutomaticRemoval usingBlock:^ (id<AspectInfo> info) {
            [toolTips hideAnimated:YES];
        } error:nil];

        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_TIP_PUBLISH_RENT_DISPLAYED];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
}

- (void)checkSetupLanguageNeedShowAlert:(BOOL)show {

    CUTEUser *user = [CUTEDataManager sharedInstance].user;
    NSString *currentCookieLang = [[CUTELocalizationSwitcher sharedInstance] currentCookieLocalization];
    NSString *currentSystemLang = [CUTEConfiguration enableMultipleLanguage]? [[CUTELocalizationSwitcher sharedInstance] currentSystemLocalization]: @"zh_Hans_CN";


    typedef void(^UpdateLocalizationBlock)(NSString *localization);

    UpdateLocalizationBlock updateBlock = ^ (NSString *localizatoin) {
        [[CUTEWebArchiveManager sharedInstance] clear];
        [[CUTELocalizationSwitcher sharedInstance] setCurrentLocalization:localizatoin];
    };

    dispatch_block_t showAlert = ^ {
        [UIAlertView showWithTitle:STR(@"AppDelegate/您的语言偏好与当前系统语言不一致，您可以在“我” -> “设置” 中设置语言") message:nil cancelButtonTitle:STR(@"OK") otherButtonTitles:nil tapBlock:^(UIAlertView *alertView, NSInteger buttonIndex) {

        }];
    };

    if (user) {
        NSString *currentUserLang = IsArrayNilOrEmpty(user.locales)? nil: [user.locales firstObject];
        if (currentCookieLang) {
            if (!IsNilNullOrEmpty(currentUserLang) && ![currentCookieLang isEqualToString:currentUserLang]) {
                if (show && [CUTEConfiguration enableMultipleLanguage]) {
                    showAlert();
                }
            }
        }
        else {
            updateBlock(currentSystemLang);
            if (!IsNilNullOrEmpty(currentUserLang) && ![currentSystemLang isEqualToString:currentUserLang]) {
                if (show && [CUTEConfiguration enableMultipleLanguage]) {
                    showAlert();
                }
            }
        }
    }
    else {
        if (!currentCookieLang) {
            updateBlock(currentSystemLang);
        }
    }
}


#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UINavigationController *)viewController {
    //only update when first create, not care the controller push and pop
    if (viewController.tabBarItem.tag == kEditTabBarIndex && viewController.topViewController == nil) {

        if (_reloadPublishRentTicketTabTask && !_reloadPublishRentTicketTabTask.isCompleted) {
            if (![SVProgressHUD isVisible]) {
                [SVProgressHUD show];
            }
        }
        else {
            _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:NO];
        }
    }
    //when show unfinished list controller, show type list page to add new one
    else if (viewController.tabBarItem.tag == kEditTabBarIndex && viewController.topViewController != nil) {
        if (_lastSelectedTabIndex == tabBarController.selectedIndex) {
            if ([viewController.topViewController isKindOfClass:[CUTEUnfinishedRentTicketListViewController class]]) {
                [self pushRentTypeViewControllerInNavigationController:viewController animated:YES];
            }
        }
        else  {
            [self updateUserPropertiesLeftBarButtonItemWithViewController:viewController.topViewController];

            if (_reloadPublishRentTicketTabTask && !_reloadPublishRentTicketTabTask.isCompleted) {
                if (![SVProgressHUD isVisible]) {
                    [SVProgressHUD show];
                }
            }
        }
    }
    else {
        if (viewController.tabBarItem.tag == kRentTicketListTabBarIndex) {
            TrackEvent(@"tab-bar", kEventActionPress, @"open-rent-ticket-list-tab", nil);
        }

        [self updateWebViewControllerTabAtIndex:tabBarController.selectedIndex];

        if (viewController.tabBarItem.tag == kUserTabBarIndex) {
            if ([viewController.topViewController isKindOfClass:[CUTEWebViewController class]]) {

                CUTEWebViewController *webViewController = (CUTEWebViewController *)viewController.topViewController;
                dispatch_block_t setupLeftBarButtonItem = ^ {

                    webViewController.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"User/设置") style:UIBarButtonItemStylePlain block:^(id weakSender) {
                        [webViewController.navigationController openRouteWithURL:[NSURL URLWithString:@"yangfd://setting/"]];
                    }];
                };
                setupLeftBarButtonItem();

                [webViewController aspect_hookSelector:@selector(updateBackButton) withOptions:AspectPositionAfter usingBlock:^ (id<AspectInfo> info) {
                    if (![webViewController webViewCanGoBack]) {
                        setupLeftBarButtonItem();

                    }
                } error:nil];
            }
            else if ([viewController.topViewController isKindOfClass:[UIViewController class]]) {
                viewController.topViewController.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"User/设置") style:UIBarButtonItemStylePlain block:^(id weakSender) {
                    [viewController openRouteWithURL:[NSURL URLWithString:@"yangfd://setting/"]];
                }];
            }
        }
    }

    _lastSelectedTabIndex = tabBarController.selectedIndex;
}

- (void)pushRentTypeViewControllerInNavigationController:(UINavigationController *)viewController animated:(BOOL)animated {
    [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
        if (task.result) {
            CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
            [form setRentTypeList:task.result];
            CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
            controller.formController.form = form;
            controller.hidesBottomBarWhenPushed = YES;
            [viewController pushViewController:controller animated:animated];
        }
        else {
            [SVProgressHUD showErrorWithError:task.error];
        }
        return nil;
    }];
}

- (void)updateWebViewControllerTabAtIndex:(NSInteger)index {
    UINavigationController *viewController = [[self.tabBarController viewControllers] objectAtIndex:index];

    if (IsArrayNilOrEmpty(viewController.viewControllers)) {
        NSURL *URL = [self tabbarURLWithIndex:index];
        if ([[CUTEWebArchiveManager sharedInstance] hasWebArchiveForURL:URL]) {
            [viewController openRouteWithURL:[NSURL URLWithString:CONCAT(@"webarchive://localhost/?from=", URL.absoluteString.URLEncode)]];
        }
        else {
            [viewController openRouteWithURL:URL];
        }

        if (URL.isHttpOrHttpsURL) {
            [[CUTEWebArchiveManager sharedInstance]  archiveURL:URL];
        }
    }
    else {
        if ([viewController.topViewController isKindOfClass:[CUTEWebViewController class]]) {
            CUTEWebViewController *webViewController = (CUTEWebViewController *)viewController.topViewController;
            if (_lastSelectedTabIndex == self.tabBarController.selectedIndex) {
                //在网络情况不好时，可能加载没有正常开始，比如在飞行模式，这个时候 request.URL.absoluteString 长度为0，那么就需要重新开始加载，而不是reload
                if (IsNilOrNull(webViewController.webView.request) || IsNilOrNull(webViewController.webView.request.URL) || IsNilNullOrEmpty(webViewController.webView.request.URL.absoluteString)) {
                    [webViewController loadRequest:[NSURLRequest requestWithURL:webViewController.URL]];
                }
                else {
                    [webViewController reload];
                }

                NSURL *URL = webViewController.URL;
                if (URL.isHttpOrHttpsURL) {
                    [[CUTEWebArchiveManager sharedInstance] archiveURL:URL];
                }
            }
        }
    }
}


- (BFTask *)reloadPublishRentTicketTabSilent:(BOOL)silent{

    BFTaskCompletionSource *tcs = [BFTaskCompletionSource taskCompletionSource];

    Sequencer *sequencer = [Sequencer new];

    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            if (!silent) {
                [SVProgressHUD show];
            }
            [[[CUTERentTicketPublisher sharedInstance] syncTicketsWithCancellationToken:nil] continueWithBlock:^id(BFTask *task) {
                if (task.error) {
                    [SVProgressHUD showErrorWithError:task.error];
                    [tcs setResult:nil];
                }
                else if (task.exception) {
                    [SVProgressHUD showErrorWithException:task.exception];
                    [tcs setResult:nil];
                }
                else if (task.isCancelled) {
                    [SVProgressHUD showErrorWithCancellation];
                    [tcs setResult:nil];
                }
                else {
                    completion(task.result);
                }
                return task;
            }];
        }];
    }
    else {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            completion([[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets]);
        }];
    }

    [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
        [SVProgressHUD dismiss];
        UINavigationController *viewController = [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex];
        NSArray *unfinishedRentTickets = result;
        if (unfinishedRentTickets.count == 0) {
            //TODO handle silent， Redesign the HUD for specific controller
            //这里用户第一进入 app 时会 trigger load hud 不是很友好，可以考虑切到这个 tab 再 show, 这里面的 task，外界无法知道状态，所以不是很好, 所以第一次只在后台加载资源，不加载界面。
            [viewController openRouteWithURL:[NSURL URLWithString:@"yangfd://property-to-rent/create?_clear_stack=true"]];
        }
        else if (unfinishedRentTickets.count > 0) {
            [viewController openRouteWithURL:[NSURL URLWithString:@"yangfd://property-to-rent-list/?status=draft&_clear_stack=true&_reload=false"]];
        }

        [self updateUserPropertiesLeftBarButtonItemWithViewController:viewController.topViewController];

        [tcs setResult:unfinishedRentTickets];
    }];

    [sequencer run];

    return tcs.task;
}

- (void)updateUserPropertiesLeftBarButtonItemWithViewController:(UIViewController *)controller {
    controller.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithTitle:STR(@"AppDelegate/已发布") style:UIBarButtonItemStylePlain block:^(id weakSender) {

        NSURL *url = [NSURL URLWithString:@"/user-properties#rentOnly?status=to%20rent%2Crent"  relativeToURL:[CUTEConfiguration hostURL]];
        [controller.navigationController openRouteWithURL:url];
    }];
}

- (void)checkAppUpdate
{
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(10 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *checkUrl = @"/api/1/app/currant/check_update";
        NSDictionary *appInfo = [[NSBundle mainBundle] infoDictionary];
        //Notice: here the version is the build number, and the build number base on the git commit change
        NSDictionary *checkParams = @{@"version":[appInfo objectForKey:(NSString *)kCFBundleVersionKey], @"platform":@"ios", @"channel":[appInfo objectForKey:@"CurrantChannel"]};
        NSURLRequest *request = [[[[CUTEAPIManager sharedInstance] backingManager] requestSerializer] requestWithMethod:@"GET" URLString:[NSURL URLWithString:checkUrl relativeToURL:[NSURL URLWithString:[CUTEConfiguration apiEndpoint]]].absoluteString parameters:checkParams error:nil];
        [[BBTAppUpdater sharedInstance] checkUpdateWithRequeset:request];
    });
}


#pragma mark - Push Notification

- (void)onReceiveTicketPublish:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEDataManager sharedInstance] deleteTicket:ticket];
    if (!_reloadPublishRentTicketTabTask || _reloadPublishRentTicketTabTask.isCompleted) {
        _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:YES];
    }

    //wait the bottom bar show animation, then present new controller
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        CUTERentShareViewController *shareController = [CUTERentShareViewController new];
        shareController.ticket = ticket;
//        CUTERentShareForm *form = [CUTERentShareForm new];
//        form.ticket = ticket;
//        shareController.formController.form = form;
        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
        [self.tabBarController presentViewController:nc animated:NO completion:nil];
    });
}

- (void)onReceiveTicketWechatShare:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEShareManager sharedInstance] shareTicket:ticket viewController:self.tabBarController onButtonPressBlock:^(NSString *buttonName) {
        if ([buttonName isEqualToString:CUTEShareServiceWechatFriend]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-friend", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceWechatCircle]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-circle", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceSinaWeibo]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"weibo", @(1));
        }
    }];
}

- (void)onReceivePropertyShare:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTEProperty *property = userInfo[@"property"];
    [[CUTEShareManager sharedInstance] shareProperty:property viewController:self.tabBarController onButtonPressBlock:^(NSString *buttonName) {
        if ([buttonName isEqualToString:CUTEShareServiceWechatFriend]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-friend", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceWechatCircle]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"wechat-circle", @(1));
        }
        else if ([buttonName isEqualToString:CUTEShareServiceSinaWeibo]) {
            TrackEvent(KEventCategoryShare, kEventActionPress, @"weibo", @(1));
        }
    }];
}

- (void)onReceiveTicketListReload:(NSNotification *)notif {
    UIViewController *fromController = (UIViewController *)notif.object;

    NSArray *unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
    UINavigationController *navController = [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex];

    UIViewController *bottomViewController = [navController.viewControllers firstObject];
    if (unfinishedRentTickets.count > 0) {
        if ([bottomViewController isKindOfClass:[CUTEUnfinishedRentTicketListViewController class]]) {
            CUTEUnfinishedRentTicketListViewController *unfinishedController = (CUTEUnfinishedRentTicketListViewController *)bottomViewController;
            unfinishedController.form.unfinishedRentTickets = unfinishedRentTickets;
            [unfinishedController.tableView reloadData];

            [self updateUserPropertiesLeftBarButtonItemWithViewController:unfinishedController];
        }
        else {
            CUTEUnfinishedRentTicketListViewController *unfinishedRentTicketController = [CUTEUnfinishedRentTicketListViewController new];
            unfinishedRentTicketController.form = [CUTEUnfinishedRentTicketListForm new];

            if (fromController.navigationController == navController) {
                NSMutableArray *viewControllers = [NSMutableArray arrayWithArray:navController.viewControllers];
                [viewControllers insertObject:unfinishedRentTicketController atIndex:0];
                [navController setViewControllers:viewControllers animated:NO];
            }
            else {
                NSMutableArray *viewControllers = [NSMutableArray array];
                [viewControllers insertObject:unfinishedRentTicketController atIndex:0];
                [navController setViewControllers:viewControllers animated:NO];
            }

            unfinishedRentTicketController.form.unfinishedRentTickets = unfinishedRentTickets;
            [unfinishedRentTicketController.tableView reloadData];

            [self updateUserPropertiesLeftBarButtonItemWithViewController:unfinishedRentTicketController];
        }

    }
    else {
        [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
            if (task.result) {
                CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
                [form setRentTypeList:task.result];
                CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
                controller.formController.form = form;

                if (fromController.navigationController == navController) {
                    NSMutableArray *viewControllers = [NSMutableArray arrayWithArray:navController.viewControllers];
                    [viewControllers insertObject:controller atIndex:0];
                    [navController setViewControllers:viewControllers animated:NO];
                }
                else {
                    NSMutableArray *viewControllers = [NSMutableArray array];
                    [viewControllers insertObject:controller atIndex:0];
                    [navController setViewControllers:viewControllers animated:NO];
                }

                [self updateUserPropertiesLeftBarButtonItemWithViewController:controller];
            }
            return nil;
        }];
    }

}

- (void)onReceiveHideRootTabBar:(NSNotification *)notif {
    [self.tabBarController setTabBarHidden:YES animated:YES];
}

- (void)onReceiveShowRootTabBar:(NSNotification *)notif {
    [self.tabBarController setTabBarHidden:NO animated:YES];
}

- (void)onReceiveShowHomeTab:(NSNotification *)notif {
    UINavigationController *nav = [[self.tabBarController viewControllers] objectAtIndex:kHomeTabBarIndex];
    if (nav == [(UIViewController *)notif.object navigationController]) {
        [nav popToRootViewControllerAnimated:YES];
    }
    [self.tabBarController setSelectedIndex:kHomeTabBarIndex];
    [self updateWebViewControllerTabAtIndex:kHomeTabBarIndex];
    _lastSelectedTabIndex = kHomeTabBarIndex;
}

- (void)onReceiveUserDidLogin:(NSNotification *)notif {
    CUTEUser *user = [notif.userInfo objectForKey:@"user"];

    [[CUTEDataManager sharedInstance] saveUser:user];
    [[CUTEDataManager sharedInstance] persistAllCookies];
    [self checkSetupLanguageNeedShowAlert:YES];

    NSArray *unbindedTicket = [[[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets] select:^BOOL(CUTETicket *object) {
        return object.creatorUser == nil;
    }];

    if (!IsArrayNilOrEmpty(unbindedTicket)) {
        [SVProgressHUD showWithStatus:STR(@"AppDelegate/同步中...")];
        [[[CUTERentTicketPublisher sharedInstance] bindTickets:unbindedTicket] continueWithBlock:^id(BFTask *task) {
            if (task.error) {
                [SVProgressHUD showErrorWithError:task.error];
            }
            else if (task.exception) {
                [SVProgressHUD showErrorWithException:task.exception];
            }
            else if (task.isCancelled) {
                [SVProgressHUD showErrorWithCancellation];
            }
            else {
                [SVProgressHUD dismiss];
                if (notif.object && [notif.object isKindOfClass:[UIViewController class]] && [(UIViewController *)notif.object navigationController] == [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex]) {
                    //login in the create process, not reload the list
                }
                else {
                    if (!_reloadPublishRentTicketTabTask || _reloadPublishRentTicketTabTask.isCompleted) {
                        _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:YES];
                    }
                }
            }
            return task;
        }];

    }
    else {
        if (notif.object && [notif.object isKindOfClass:[UIViewController class]] && [(UIViewController *)notif.object navigationController] == [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex]) {
            //login in the create process, not reload the list
        }
        else {
            if (!_reloadPublishRentTicketTabTask || _reloadPublishRentTicketTabTask.isCompleted) {
                _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:YES];
            }
        }
    }
}

- (void)onReceiveUserDidLogout:(NSNotification *)notif {
    [[CUTEDataManager sharedInstance] clearAllRentTickets];
    _reloadPublishRentTicketTabTask = [self reloadPublishRentTicketTabSilent:YES];
}

- (void)onReceiveMarkUserAsLandlord:(NSNotification *)notif {
    CUTEUser *user = notif.userInfo[@"user"];
    BOOL userIsLandlord = [user.userTypes find:^BOOL(CUTEEnum *object) {
        return [object.slug isEqualToString:@"landlord"];
    }] != nil;

    if (!userIsLandlord) {
        [[[CUTEAPICacheManager sharedInstance] getEnumsByType:@"user_type"] continueWithSuccessBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTEEnum *landlordUserType = [task.result find:^BOOL(CUTEEnum *object) {
                    return [object.slug isEqualToString:@"landlord"];
                }];
                NSMutableArray *types = [NSMutableArray arrayWithArray:user.userTypes];
                [types addObject:landlordUserType];

                NSString *typeList = [[types map:^id(CUTEEnum *object) {
                    return object.identifier;
                }] componentsJoinedByString:@","];

                [[[CUTEAPIManager sharedInstance] POST:@"/api/1/user/edit" parameters:@{@"user_type": typeList} resultClass:[CUTEUser class]] continueWithBlock:^id(BFTask *task) {
                    if (task.error) {
                        [SVProgressHUD showErrorWithError:task.error];
                    }
                    else if (task.exception) {
                        [SVProgressHUD showErrorWithException:task.exception];
                    }
                    else if (task.isCancelled) {
                        [SVProgressHUD showErrorWithCancellation];
                    }
                    else {
                        if (task.result && [task.result isKindOfClass:[CUTEUser class]])  {
                            [[CUTEDataManager sharedInstance] saveUser:task.result];
                        }
                    }

                    return task;
                }];
            }
            return task;
        }];
    }
}

- (void)onReceiveUserVerifyPhone:(NSNotification *)notif {
    CUTEUser *user = notif.userInfo[@"user"];
    NSNumber *whileEditingTicket = notif.userInfo[@"whileEditingTicket"];

    if (user.phoneVerified) {
        return;
    }

    [SVProgressHUD showWithStatus:STR(@"AppDelegate/获取验证中...")];
    [[[CUTEAPICacheManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
        if (task.error) {
            [SVProgressHUD showErrorWithError:task.error];
        }
        else if (task.exception) {
            [SVProgressHUD showErrorWithException:task.exception];
        }
        else if (task.isCancelled) {
            [SVProgressHUD showErrorWithCancellation];
        }
        else {
            CUTERentConfirmPhoneViewController *controller = [[CUTERentConfirmPhoneViewController alloc] init];
            controller.whileEditingTicket = whileEditingTicket.boolValue;
            CUTERentConfirmPhoneForm *form = [CUTERentConfirmPhoneForm new];
            [form setAllCountries:task.result];
            //set default country same with the property
            if (user.countryCode) {
                for (CUTECountry *object in task.result) {
                    if ([object.countryCode isEqualToNumber:user.countryCode]) {
                        form.country = object;
                    }
                }
            }
            form.phone = user.phone;
            form.user = user;
            controller.formController.form = form;
            UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:controller];
            [self.tabBarController presentViewController:nav animated:YES completion:^{

            }];
            [SVProgressHUD dismiss];
        }

        return task;
    }];
}

- (void)onReceiveShowSplashView:(NSNotification *)notif {

}

- (void)onReceiveLocalizationDidUpdate:(NSNotification *)notif {

    //refresh all tabs
    NSArray *titles = [self tabbarTitles];
    [self.tabBarController.tabBar.items eachWithIndex:^(UITabBarItem *item, NSUInteger index) {
        item.title = titles[index];
    }];

    UINavigationController *publishNavigationController = self.tabBarController.viewControllers[kEditTabBarIndex];
    [self updateUserPropertiesLeftBarButtonItemWithViewController:publishNavigationController.topViewController];

    //clear web cache
    [[CUTEWebArchiveManager sharedInstance] clear];

    //clear api cache
    //TODO refresh api cache related page
    [[CUTEAPICacheManager sharedInstance] clear];
    [[CUTEAPICacheManager sharedInstance] refresh];
}

@end
