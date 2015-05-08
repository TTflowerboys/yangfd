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
#import "CUTEUnfinishedRentTicketViewController.h"
#import "CUTERentTickePublisher.h"
#import "CUTEPropertyInfoForm.h"
#import "CUTEPropertyInfoViewController.h"
#import "CUTEImageUploader.h"
#import <GAI.h>
#warning DEBUG_CODE
#ifdef DEBUG
#import <AFNetworkActivityLogger.h>
#import <FLEXManager.h>
#endif

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

#define kEditTabBarIndex 2

- (UINavigationController *)makeViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {

    CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
    UINavigationController *nav = [[UINavigationController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal] selectedImage:[[UIImage imageNamed:CONCAT(icon, @"-active")] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal]];
    controller.url = [NSURL WebURLWithString:urlPath];
    nav.tabBarItem = tabItem;
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

    // Optional: automatically send uncaught exceptions to Google Analytics.
    [GAI sharedInstance].trackUncaughtExceptions = YES;

    // Optional: set Google Analytics dispatch interval to e.g. 20 seconds.
    [GAI sharedInstance].dispatchInterval = 20;

    // Optional: set Logger to VERBOSE for debug information.
    [[[GAI sharedInstance] logger] setLogLevel:kGAILogLevelVerbose];

    // Initialize tracker. Replace with your tracking ID.
    [[GAI sharedInstance] trackerWithTrackingId:@"UA-55542465-1"];

    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketPublish:) name:KNOTIF_TICKET_PUBLISH object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketSync:) name:KNOTIF_TICKET_SYNC object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketDelete:) name:KNOTIF_TICKET_DELETE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketEdit:) name:KNOTIF_TICKET_EDIT object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketWechatShare:) name:KNOTIF_TICKET_WECHAT_SHARE object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onReceiveTicketListReload:) name:KNOTIF_TICKET_LIST_RELOAD object:nil];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    UINavigationController *homeViewController = [self makeViewControllerWithTitle:STR(@"主页") icon:@"tab-home" urlPath:@"/"];
    UINavigationController *editViewController = [self makeEditViewControllerWithTitle:STR(@"发布") icon:@"tab-edit" urlPath:@"/rent_new"];
    [rootViewController setViewControllers:@[
                                             homeViewController,
                                             [self makePropertyListViewControllerWithTitle:STR(@"新房") icon:@"tab-property" urlPath:@"/property_list"],
                                             editViewController,
                                             [self makeViewControllerWithTitle:STR(@"租房") icon:@"tab-rent" urlPath:@"/property_to_rent_list"],
                                             [self makeViewControllerWithTitle:STR(@"我") icon:@"tab-user" urlPath:@"/user"],
                                             ] animated:YES];
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
//    CUTEWebViewController *firstWebviewController = (CUTEWebViewController *)([(UINavigationController *)[rootViewController.viewControllers firstObject] topViewController]);
//    [firstWebviewController loadURL:firstWebviewController.url];

    [[CUTEEnumManager sharedInstance] startLoadAllEnums];

#warning DEBUG_CODE
#ifdef DEBUG
    [[AFNetworkActivityLogger sharedLogger] setLevel:AFLoggerLevelInfo];
    [[AFNetworkActivityLogger sharedLogger] startLogging];
//    [[FLEXManager sharedManager] showExplorer];

//    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
//        CUTETicket *ticket = [CUTETicket new];
//        ticket.title = @"";
//        CUTERentShareViewController *shareController = [CUTERentShareViewController new];
//        shareController.formController.form = [CUTERentShareForm new];
//        shareController.ticket = ticket;
//        UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
//        [self.tabBarController presentViewController:nc animated:NO completion:nil];
//    });
#endif
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

#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UINavigationController *)viewController {
    //only update when first create, not care the controller push and pop
    if (viewController.tabBarItem.tag == kEditTabBarIndex && viewController.topViewController == nil) {
        [self updatePublishRentTicketTabWithController:viewController silent:NO];
    }
}

- (void)updatePublishRentTicketTabWithController:(UINavigationController *)viewController silent:(BOOL)silent {
    NSArray *unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];

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
        CUTEUnfinishedRentTicketViewController *unfinishedRentTicketController = [CUTEUnfinishedRentTicketViewController new];
        [viewController setViewControllers:@[unfinishedRentTicketController] animated:NO];
    }
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

    CUTERentShareViewController *shareController = [CUTERentShareViewController new];
    shareController.formController.form = [CUTERentShareForm new];
    shareController.ticket = ticket;
    UINavigationController *nc = [[UINavigationController alloc] initWithRootViewController:shareController];
    [self.tabBarController presentViewController:nc animated:NO completion:nil];
}

- (void)onReceiveTicketSync:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    if (ticket && ticket.identifier) {
        if ([ticket.status isEqualToString:kTicketStatusDraft]) {
            [[CUTEDataManager sharedInstance] saveRentTicketToUnfinised:ticket];
        }
        [[CUTERentTickePublisher sharedInstance] editTicketExcludeImage:ticket];
    }
}

- (void)onReceiveTicketEdit:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    UIViewController *webController = (UIViewController *)notif.object;

    if (ticket && webController && [webController isKindOfClass:[UIViewController class]] && webController.navigationController) {
        [[[CUTEEnumManager sharedInstance] getEnumsByType:@"property_type"] continueWithBlock:^id(BFTask *task) {
            if (!IsArrayNilOrEmpty(task.result)) {
                CUTEPropertyInfoViewController *controller = [[CUTEPropertyInfoViewController alloc] init];
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

- (void)onReceiveTicketWechatShare:(NSNotification *)notif {
    NSDictionary *userInfo = notif.userInfo;
    CUTETicket *ticket = userInfo[@"ticket"];
    [[CUTEWxManager sharedInstance] shareToWechatWithTicket:ticket];
}

- (void)onReceiveTicketListReload:(NSNotification *)notif {
    NSArray *unfinishedRentTickets = [[CUTEDataManager sharedInstance] getAllUnfinishedRentTickets];
    UINavigationController *navController = [[self.tabBarController viewControllers] objectAtIndex:kEditTabBarIndex];
    if (unfinishedRentTickets.count > 0) {
        if ([navController.topViewController isKindOfClass:[CUTEUnfinishedRentTicketViewController class]]) {
            CUTEUnfinishedRentTicketViewController *unfinishedController = (CUTEUnfinishedRentTicketViewController *)navController.topViewController;
            [unfinishedController reloadData];
        }
        else {
            NSMutableArray *viewControllers = [NSMutableArray arrayWithArray:navController.viewControllers];
            CUTEUnfinishedRentTicketViewController *unfinishedRentTicketController = [CUTEUnfinishedRentTicketViewController new];
            [viewControllers insertObject:unfinishedRentTicketController atIndex:0];
            [navController setViewControllers:viewControllers animated:NO];

        }
    }
    else {
        if (![navController.topViewController isKindOfClass:[CUTERentTypeListViewController class]]) {
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

@end
