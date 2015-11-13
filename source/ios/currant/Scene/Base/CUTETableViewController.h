//
//  CUTETableViewController.h
//  currant
//
//  Created by Foster Yin on 11/13/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "currant-Swift.h"

@interface CUTETableViewController : UITableViewController

@property (nonatomic, readonly) BFCancellationTokenSourceCollector *asyncTaskCollector;

@end
