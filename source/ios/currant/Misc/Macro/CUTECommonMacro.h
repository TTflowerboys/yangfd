//
//  CUTECommonMacro.h
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#ifndef currant_CUTECommonMacro_h
#define currant_CUTECommonMacro_h

#import <BBTCommonMacro.h>
#import <BBTUIMacro.h>

#define TabBarHeight                     49
#define TabBarControllerViewFrame CGRectMake(0, 0, ScreenWidth, ScreenHeight - TabBarHeight - TouchHeightDefault - StatusBarHeight)

#define DEFAULT_I18N_LOCALE @"zh_Hans_CN"

#define TICK   NSDate *startTime = [NSDate date]

#define TOCK   NSLog(@"Time: %f", -[startTime timeIntervalSinceNow])

#endif
