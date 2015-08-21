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

//Same with format float with %g
//64-bit floating-point number (double), printed in the style of %e if the exponent is less than –4 or greater than or equal to the precision, in the style of %f otherwise.
//	NSString *gstr = [NSString stringWithFormat:@"%g", 0.01]; print 0.01
//  NSString *gstrLong = [NSString stringWithFormat:@"%g", 0.00001]; print 1e-05
#define FloatToString(x) [[NSNumber numberWithFloat:x] stringValue]

#endif
