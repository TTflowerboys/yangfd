//
//  CUTEMoblieClient.h
//  currant
//
//  Created by Foster Yin on 4/23/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <JavaScriptCore/JSExport.h>

@protocol CUTEJSExport <JSExport>

- (void)log:(JSValue *)message;

- (void)signin:(JSValue *)result;

- (void)logout:(JSValue *)result;

- (void)editRentTicket:(JSValue *)result;

- (void)wechatShareRentTicket:(JSValue *)result;

@end


@interface CUTEMoblieClient : NSObject <CUTEJSExport>

@property (nonatomic, weak) UIViewController *controller;


@end
