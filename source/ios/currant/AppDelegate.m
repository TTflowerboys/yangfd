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
#import "CUTEEnumManager.h"
#import "CUTERentTypeListForm.h"
#import <AFNetworkActivityIndicatorManager.h>
#import "SVProgressHUD+CUTEAPI.h"
#import "CUTEWxManager.h"
#import "CUTENotificationKey.h"
#import "CUTETicket.h"
#import "CUTERentShareViewController.h"
#import "CUTERentShareForm.h"
#import "CUTEUnfinishedRentTicketListViewController.h"
#import "CUTERentTickePublisher.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTERentPropertyInfoViewController.h"
#import "CUTEImageUploader.h"
#import "CUTETracker.h"
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import <Crittercism.h>
#warning DEBUG_CODE
#ifdef DEBUG
#import <AFNetworkActivityLogger.h>
#endif
#import "CUTESplashViewController.h"
#import "CUTEUserDefaultKey.h"
#import "MemoryReporter.h"
#import "UITabBarController+HideTabBar.h"
#import "Sequencer.h"
#import "CUTERentContactViewController.h"


@interface AppDelegate () <UITabBarControllerDelegate>

@property (nonatomic, strong) UITabBarController *tabBarController;

@end

@implementation AppDelegate

//http://stackoverflow.com/questions/7608632/how-do-i-get-the-current-version-of-my-ios-project-in-code
+ (NSString *) appVersion
{
    return [[NSBundle mainBundle] objectForInfoDictionaryKey: @"CFBundleShortVersionString"];
}

+ (NSString *) build
{
    return [[NSBundle mainBundle] objectForInfoDictionaryKey: (NSString *)kCFBundleVersionKey];
}

+ (NSString *) versionBuild
{
    NSString * version = [self appVersion];
    NSString * build = [self build];

    NSString * versionBuild = [NSString stringWithFormat: @"v%@", version];

    if (![version isEqualToString: build]) {
        versionBuild = [NSString stringWithFormat: @"%@(%@)", versionBuild, build];
    }

    return versionBuild;
}

#define kHomeTabBarIndex 0
#define kPropertyListTabBarIndex 1
#define kEditTabBarIndex 2
#define kRentTicketListTabBarIndex 3
#define kUserTabBarIndex 4

- (UINavigationController *)makeViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath index:(NSInteger)index {

    CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
    nav.tabBarItem.tag = index;
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}

- (UINavigationController *)makePropertyListViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTEPropertyListViewController *controller = [[CUTEPropertyListViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
    nav.tabBarItem.tag = kPropertyListTabBarIndex;
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}

- (UINavigationController *)makeRentListViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTERentListViewController *controller = [[CUTERentListViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
    nav.tabBarItem.tag = kRentTicketListTabBarIndex;
    controller.navigationItem.title = STR(@"洋房东");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    [nav setViewControllers:@[controller]];
    return nav;
}


- (UINavigationController *)makeEditViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:nil];
    tabItem.tag = kEditTabBarIndex;
    nav.tabBarItem = tabItem;

    [nav.tabBarItem setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]} forState:UIControlStateNormal];
    [nav.tabBarItem setTitleTextAttributes:@{NSForegroundColorAttributeName: [UIColor colorWithRed:255.0/255.0 green:255.0/255.0 blue:255.0/255.0 alpha:1.0]} forState:UIControlStateSelected];
    nav.title = STR(@"出租发布");
    [[nav navigationBar] setBarStyle:UIBarStyleBlackTranslucent];
    return nav;
}


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    [[AFNetworkActivityIndicatorManager sharedManager] setEnabled:YES];
    NSArray *userAgentComponents =  @[[[NSBundle mainBundle] bundleIdentifier], [AppDelegate versionBuild]];
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[userAgentComponents componentsJoinedByString:@"/"], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];

    [CUTEWxManager registerWeixinAPIKey:[CUTEConfiguration weixinAPPId]];
    [[CUTETracker sharedInstance] setup];

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketPublish:) name:KNOTIF_TICKET_PUBLISH object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketSync:) name:KNOTIF_TICKET_SYNC object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketDelete:) name:KNOTIF_TICKET_DELETE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketEdit:) name:KNOTIF_TICKET_EDIT object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveTicketCreate:) name:KNOTIF_TICKET_CREATE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketWechatShare:) name:KNOTIF_TICKET_WECHAT_SHARE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketListReload:) name:KNOTIF_TICKET_LIST_RELOAD object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveHideRootTabBar:) name:KNOTIF_HIDE_ROOT_TAB_BAR object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveShowRootTabBar:) name:KNOTIF_SHOW_ROOT_TAB_BAR object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveShowFavoriteRentTicketList:) name:KNOTIF_SHOW_FAVORITE_RENT_TICKET_LIST object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogin:) name:KNOTIF_USER_DID_LOGIN object:nil];
    [NotificationCenter addObserver:self selector:@selector(onReceiveUserDidLogout:) name:KNOTIF_USER_DID_LOGOUT object:nil];


    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    UINavigationController *homeViewController = [self makeViewControllerWithTitle:STR(@"主页") icon:@"tab-home" urlPath:@"/" index:kHomeTabBarIndex];

    UINavigationController *editViewController = [self makeEditViewControllerWithTitle:STR(@"发布") icon:@"tab-edit" urlPath:@"/rent_new"];
    UINavigationController *propertyListViewController = [self makePropertyListViewControllerWithTitle:STR(@"新房") icon:@"tab-property" urlPath:@"/property-list"];
    UINavigationController *rentTicketListViewController = [self makeRentListViewControllerWithTitle:STR(@"租房") icon:@"tab-rent" urlPath:@"/property-to-rent-list"];
    UINavigationController *userViewController = [self makeViewControllerWithTitle:STR(@"我") icon:@"tab-user" urlPath:@"/user" index: kUserTabBarIndex];
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
    CUTEWebViewController *firstWebviewController = (CUTEWebViewController *)([(UINavigationController *)[rootViewController.viewControllers firstObject] topViewController]);
    [firstWebviewController loadURL:firstWebviewController.url];

    [[CUTEEnumManager sharedInstance] startLoadAllEnums];

    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_SPLASH_DISPLAYED]) {
        CUTESplashViewController *spalshViewController = [CUTESplashViewController new];
        spalshViewController.completion = ^ {
            [self checkNeedShowBetaUserRegister];
        };
        [rootViewController presentViewController:spalshViewController animated:NO completion:nil];
        [[NSUserDefaults standardUserDefaults] setBool:YES forKey:CUTE_USER_DEFAULT_SPLASH_DISPLAYED];
        [[NSUserDefaults standardUserDefaults] synchronize];
    }
    else {
        [self checkNeedShowBetaUserRegister];
    }


//#warning DEBUG_CODE
//#ifdef DEBUG

//    [CrashlyticsKit crash];
//    [NSClassFromString(@"WebView") performSelector:NSSelectorFromString(@"_enableRemoteInspector")];
//    [[AFNetworkActivityLogger sharedLogger] setLevel:AFLoggerLevelInfo];
//    [[AFNetworkActivityLogger sharedLogger] startLogging];   

//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        CUTETicket *ticket = [CUTETicket new];
//        ticket.title = @"";
//        CUTERentShareViewController *shareController = [CUTERentShareViewController new];
//        shareController.formController.form = [CUTERentShareForm new];
//        shareController.ticket = ticket;
//        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
//        [self.tabBarController presentViewController:nc animated:NO completion:nil];
//    });
//#endif

    [Crittercism enableWithAppID:@"55596173b60a7d3e63908c50"];
    //TODO setup use user id in track and crash report
    [Fabric with:@[CrashlyticsKit]];

    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    [[CUTEDataManager sharedInstance] saveAllCookies];
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
    // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    [[CUTEDataManager sharedInstance] restoreAllCookies];
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
    return [[CUTEWxManager sharedInstance] handleOpenURL:url];
}

- (void)applicationDidReceiveMemoryWarning:(UIApplication *)application {
    [[CUTETracker sharedInstance] trackMemoryWarning];
}

- (void)checkNeedShowBetaUserRegister {

    if (![[NSUserDefaults standardUserDefaults] boolForKey:CUTE_USER_DEFAULT_BETA_USER_REGISTERED]) {
        [SVProgressHUD show];
        [[[CUTEEnumManager sharedInstance] getCountriesWithCountryCode:YES] continueWithBlock:^id(BFTask *task) {
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
                CUTERentContactViewController *contactViewController = [CUTERentContactViewController new];
                CUTERentContactForm *form = [CUTERentContactForm new];
                form.isOnlyRegister = YES;
                form.isInvitationCodeRequired = YES;
                [form setAllCountries:task.result];
                contactViewController.formController.form = form;
                UINavigationController *nav = [[UINavigationController alloc] initWithRootViewController:contactViewController];
                [self.tabBarController presentViewController:nav animated:NO completion:^{

                }];
                [SVProgressHUD dismiss];
            }

            return task;
        }];
    }
}

#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UINavigationController *)viewController {
    //only update when first create, not care the controller push and pop
    if (viewController.tabBarItem.tag == kEditTabBarIndex && viewController.topViewController == nil) {
//        [CrashlyticsKit crash];
        [self updatePublishRentTicketTabWithController:viewController silent:NO];
    }
    else {
        if (viewController.tabBarItem.tag == kRentTicketListTabBarIndex) {
            TrackEvent(@"tab-bar", kEventActionPress, @"open-rent-ticket-list-tab", nil);
        }

        if ([viewController.topViewController isKindOfClass:[CUTEWebViewController class]]) {
            CUTEWebViewController *webViewController = (CUTEWebViewController *)viewController.topViewController;
            if (!webViewController.webView.request) {// web page not load, so load it
                [webViewController loadURL:webViewController.url];
            }
        }
    }
}

- (void)updatePublishRentTicketTabWithController:(UINavigationController *)viewController silent:(BOOL)silent {

    Sequencer *sequencer = [Sequencer new];

    if ([CUTEDataManager sharedInstance].isUserLoggedIn) {
        [sequencer enqueueStep:^(id result, SequencerCompletion completion) {
            if (!silent) {
                [SVProgressHUD show];
            }
            [[[CUTERentTickePublisher sharedInstance] syncTickets] continueWithBlock:^id(BFTask *task) {
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
        NSArray *unfinishedRentTickets = result;
        if (unfinishedRentTickets.count == 0) {
            if (!silent) {
                [SVProgressHUD show];
            }
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
                if (task.result) {
                    CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
                    [form setRentTypeList:task.result];
                    CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
                    controller.formController.form = form;
                    controller.hidesBottomBarWhenPushed = NO;
                    [viewController setViewControllers:@[controller] animated:NO];
                    if (!silent) {
                        [SVProgressHUD dismiss];
                    }
                }
                else {
                    [SVProgressHUD showErrorWithError:task.error];
                }
                return nil;
            }];
        }
        else if (unfinishedRentTickets.count > 0) {
            if (!silent) {
                [SVProgressHUD dismiss];
            }
            CUTEUnfinishedRentTicketListViewController *unfinishedRentTicketController = [CUTEUnfinishedRentTicketListViewController new];
            unfinishedRentTicketController.hidesBottomBarWhenPushed = NO;
            [viewController setViewControllers:@[unfinishedRentTicketController] animated:NO];
            [unfinishedRentTicketController reloadWithTickets:unfinishedRentTickets];
        }

    }];

    [sequencer run];
}

#pragma mark - Push Notification

- (void)onReceiveTicketDelete:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEDataManager sharedInstance] deleteUnfinishedRentTicket:ticket];
    [[CUTERentTickePublisher sharedInstance] deleteTicket:ticket];
}

- (void)onReceiveTicketPublish:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEDataManager sharedInstance] deleteUnfinishedRentTicket:ticket];
    [self updatePublishRentTicketTabWithController:[[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex] silent:YES];

    //wait the bottom bar show animation, then present new controller
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        CUTERentShareViewController *shareController = [CUTERentShareViewController new];
        shareController.formController.form = [CUTERentShareForm new];
        shareController.ticket = ticket;
        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
        [self.tabBarController presentViewController:nc animated:NO completion:nil];
    });
}

- (void)onReceiveTicketSync:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    if (ticket && ticket.identifier) {

        [[CUTEDataManager sharedInstance] checkStatusAndSaveRentTicketToUnfinised:ticket];
        [[[CUTERentTickePublisher sharedInstance] editTicketExcludeImage:ticket] continueWithBlock:^id(BFTask *task) {
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
                [[CUTEDataManager sharedInstance] checkStatusAndSaveRentTicketToUnfinised:ticket];
            }

            return task;
        }];
    }
}

- (void)onReceiveTicketEdit:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    UIViewController *webController = (UIViewController *)notif.object;

    if (ticket && webController && [webController isKindOfClass:[UIViewController class]] && webController.navigationController) {
        [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTERentPropertyInfoViewController *controller = [[CUTERentPropertyInfoViewController alloc] init];
                controller.ticket = ticket;
                CUTEPropertyInfoForm *form = [CUTEPropertyInfoForm new];
                form.propertyType = ticket.property.propertyType;
                form.bedroomCount = ticket.property.bedroomCount;
                form.livingroomCount = ticket.property.livingroomCount;
                form.bathroomCount = ticket.property.bathroomCount;
                [form setAllPropertyTypes:task.result];
                controller.formController.form = form;
                [webController.navigationController pushViewController:controller animated:YES];
            }
            else {
                [SVProgressHUD showErrorWithError:task.error];
            }

            return nil;
        }];
    }
}

- (void)onReceiveTicketCreate:(NSNotification *)notif {
    [self.tabBarController setSelectedIndex:kEditTabBarIndex];
    UINavigationController *viewController = [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex];
    if (!viewController.topViewController) {
        [self updatePublishRentTicketTabWithController:[[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex] silent:NO];
    }
}


- (void)onReceiveTicketWechatShare:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEWxManager sharedInstance] shareToWechatWithTicket:ticket];
}

- (void)onReceiveTicketListReload:(NSNotification *)notif {
    NSArray *unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
    UINavigationController *navController = [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex];

    UIViewController *bottomViewController = [navController.viewControllers firstObject];
    if (unfinishedRentTickets.count > 0) {
        if ([bottomViewController isKindOfClass:[CUTEUnfinishedRentTicketListViewController class]]) {
            CUTEUnfinishedRentTicketListViewController *unfinishedController = (CUTEUnfinishedRentTicketListViewController *)bottomViewController;
            [unfinishedController reloadWithTickets:unfinishedRentTickets];
        }
        else {
            NSMutableArray *viewControllers = [NSMutableArray arrayWithArray:navController.viewControllers];
            CUTEUnfinishedRentTicketListViewController *unfinishedRentTicketController = [CUTEUnfinishedRentTicketListViewController new];
            [viewControllers insertObject:unfinishedRentTicketController atIndex:0];
            [navController setViewControllers:viewControllers animated:NO];
            [unfinishedRentTicketController reloadWithTickets:unfinishedRentTickets];
        }
    }
    else {
        if (![bottomViewController isKindOfClass:[CUTERentTypeListViewController class]]) {
            [[[CUTEEnumManager sharedInstance] getEnumsByType:@"rent_type"] continueWithBlock:^id(BFTask *task) {
                if (task.result) {
                    CUTERentTypeListForm *form = [[CUTERentTypeListForm alloc] init];
                    [form setRentTypeList:task.result];
                    CUTERentTypeListViewController *controller = [CUTERentTypeListViewController new];
                    controller.formController.form = form;
                    NSMutableArray *viewControllers = [NSMutableArray arrayWithArray:navController.viewControllers];
                    [viewControllers insertObject:controller atIndex:0];
                    [navController setViewControllers:viewControllers animated:NO];

                }
                return nil;
            }];

        }
    }
}

- (void)onReceiveHideRootTabBar:(NSNotification *)notif {
    [self.tabBarController setTabBarHidden:YES animated:YES];
}

- (void)onReceiveShowRootTabBar:(NSNotification *)notif {
    [self.tabBarController setTabBarHidden:NO animated:YES];
}


- (void)onReceiveShowFavoriteRentTicketList:(NSNotification *)notif {
    [self.tabBarController setSelectedIndex:kRentTicketListTabBarIndex];

    UINavigationController *viewController = [[self.tabBarController viewControllers] objectAtIndex:kRentTicketListTabBarIndex];
    if ([viewController.topViewController isKindOfClass:[CUTEWebViewController class]]) {
        CUTEWebViewController *webViewController = (CUTEWebViewController *)viewController.topViewController;
        [webViewController loadURLInNewController:[NSURL URLWithString:@"/user_favorites?type=rent" relativeToURL:[CUTEConfiguration hostURL]]];
    }
}


- (void)onReceiveUserDidLogin:(NSNotification *)notif {
    [self updatePublishRentTicketTabWithController:[[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex] silent:YES];
}

- (void)onReceiveUserDidLogout:(NSNotification *)notif {
    [[CUTEDataManager sharedInstance] deleteAllUnfinishedRentTickets];
    [self updatePublishRentTicketTabWithController:[[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex] silent:YES];
}

@end
