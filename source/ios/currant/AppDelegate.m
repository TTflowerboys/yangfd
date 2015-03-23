//
//  AppDelegate.m
//  currant
//
//  Created by Foster Yin on 3/20/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "AppDelegate.h"
#import "CUTEWebViewController.h"

@interface AppDelegate () <UITabBarControllerDelegate>

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

- (UIViewController *)makeViewControllerWithTitle:(NSString *)title icon:(NSString *)icon urlPath:(NSString *)urlPath {
    CUTEWebViewController *controller = [[CUTEWebViewController alloc] init];
    UITabBarItem *tabItem = [[UITabBarItem alloc] initWithTitle:title image:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal ] selectedImage:[[UIImage imageNamed:icon] imageWithRenderingMode:UIImageRenderingModeAlwaysOriginal ]];
    controller.tabBarItem = tabItem;
    controller.urlPath = urlPath;
    return controller;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    // Override point for customization after application launch.
    NSArray *userAgentComponents =  @[[[NSBundle mainBundle] bundleIdentifier], [AppDelegate versionBuild]];
    NSDictionary *dictionary = [NSDictionary dictionaryWithObjectsAndKeys:[userAgentComponents componentsJoinedByString:@"/"], @"UserAgent", nil];
    [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
    
    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UITabBarController *rootViewController = [[UITabBarController alloc] init];
    UIViewController *editViewController = [self makeViewControllerWithTitle:nil icon:@"tab-edit" urlPath:nil];
    editViewController.tabBarItem.imageInsets = UIEdgeInsetsMake(5, 0, -5, 0);
    [rootViewController setViewControllers:@[
                                             [self makeViewControllerWithTitle:STR(@"Home") icon:@"tab-home" urlPath:@"/"],
                                             [self makeViewControllerWithTitle:STR(@"Property List") icon:@"tab-property" urlPath:@"/property_list"],
                                             editViewController,
                                             [self makeViewControllerWithTitle:STR(@"Rent") icon:@"tab-rent" urlPath:@"/rent_list"],
                                             [self makeViewControllerWithTitle:STR(@"Me") icon:@"tab-user" urlPath:@"/user"],
                                             ] animated:YES];
    [self.window setRootViewController:rootViewController];
    rootViewController.delegate = self;
    // this will generate a black tab bar
    //http://stackoverflow.com/questions/18734794/how-can-i-change-the-text-and-icon-colors-for-tabbaritems-in-ios-7
    rootViewController.tabBar.barTintColor = HEXCOLOR(0x333333, 1);
    // this will give selected icons and text your apps tint color
    //rootViewController.tabBar.tintColor = HEXCOLOR(0x7a7a7a, 1);  // appTintColor is a UIColor *
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : HEXCOLOR(0x7a7a7a, 1)
                                                        } forState:UIControlStateSelected];
    
    
    // doing this results in an easier to read unselected state then the default iOS 7 one
    [[UITabBarItem appearance] setTitleTextAttributes:@{NSFontAttributeName : [UIFont fontWithName:@"HelveticaNeue-Bold" size:10.0f],
                                                        NSForegroundColorAttributeName : [UIColor colorWithRed:.5 green:.5 blue:.5 alpha:1]
                                                        } forState:UIControlStateNormal];
    [self.window makeKeyAndVisible];
    CUTEWebViewController *firstWebviewController = (CUTEWebViewController *)[rootViewController.viewControllers firstObject];
    [firstWebviewController loadURLPath:firstWebviewController.urlPath];
    return YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
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
}

- (void)applicationWillTerminate:(UIApplication *)application {
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

#pragma UITabbarViewControllerDelegate

- (void)tabBarController:(UITabBarController *)tabBarController didSelectViewController:(UIViewController *)viewController {
    if ([viewController isKindOfClass:[CUTEWebViewController class]]) {
        [(CUTEWebViewController *)viewController loadURLPath:[(CUTEWebViewController *)viewController urlPath]];
    }
}

@end
