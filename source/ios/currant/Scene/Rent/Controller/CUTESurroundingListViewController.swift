//
//  CUTESurroundingListViewController.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit


@objc(CUTESurroundingListViewController)
class CUTESurroundingListViewController: UIViewController, UITableViewDataSource, UITableViewDelegate,  UISearchBarDelegate, UISearchDisplayDelegate, CUTESurroundingSearchDelegate {

    var postcodeIndex:String?

    weak var tableView:UITableView!

    // MRRK - Private Var
    var form:CUTESurroundingForm
    var hintLabel:UILabel?


    init(form:CUTESurroundingForm) {
        self.form = form
        super.init(nibName:nil, bundle:nil)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
        self.view = UITableView(frame: CGRect.zero, style: UITableViewStyle.plain)
        self.view.frame = UIScreen.main.bounds
        self.tableView = self.view as! UITableView
        self.tableView.delegate = self
        self.tableView.dataSource = self
    }


    override func viewDidLoad() {
        super.viewDidLoad()
        self.tableView.backgroundColor = UIColor(hex6: 0xeeeeee)
        self.tableView.separatorStyle = UITableViewCellSeparatorStyle.none
        self.tableView.allowsSelection = false

        let backgroundView = UIView()
        backgroundView.backgroundColor = UIColor(hex6: 0xeeeeee)
        self.tableView.backgroundView = backgroundView

//        self.definesPresentationContext = true

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()

        self.title = STR("SurroundingList/周边")
        self.showBarButtonItems()

        //if default search don't add surrounding, user can add them
        if let surroundings = self.form.ticket.property.surroundings {
            self.showHintLabel(surroundings.count == 0)
        }
        else {
            self.showHintLabel(true)
        }
    }


    func checkShowSurroundingAddTooltip() {

        let userDefaultKey = CUTE_USER_DEFAULT_TIP_SURROUNDING_ADD_DISPLAYED
        if !UserDefaults.standard.bool(forKey: userDefaultKey)
        {

            let toolTips = CUTETooltipView(targetPoint: CGPoint(x: self.view.frame.size.width - 25, y: 54), hostView: self.navigationController?.view, tooltipText: STR("SurroundingList/点此搜索添加学校或地铁"), arrowDirection: JDFTooltipViewArrowDirection.up, width: 200)
            toolTips?.show()

            do {
                //https://github.com/steipete/Aspects/issues/51
                let closure:((Void)->Void) = {  toolTips?.hide(animated: true) }
                let block: @convention(block) (Void) -> Void = closure
                let objectBlock = unsafeBitCast(block, to: AnyObject.self)

                try self.aspect_hook(#selector(UIViewController.viewWillDisappear(_:)), with: AspectOptions(rawValue: AspectOptions.positionBefore.rawValue | AspectOptions.optionAutomaticRemoval.rawValue), usingBlock: objectBlock)
                try self.view.aspect_hook(#selector(UIView.hitTest(_:with:)), with: AspectOptions(rawValue: AspectOptions.positionBefore.rawValue | AspectOptions.optionAutomaticRemoval.rawValue), usingBlock: objectBlock)
            }
            catch let error as NSError {
                print(error)
            }

            toolTips?.show()

            UserDefaults.standard.set(true, forKey: userDefaultKey)
        }

    }

    func showBarButtonItems() {
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.add, block: { (sender) -> Void in

            let searchController = CUTESurroundingSearchViewController(form: self.form, postcodeIndex: self.postcodeIndex!)
            searchController.delegate = self
            let nav = UINavigationController(rootViewController: searchController)
            nav.modalTransitionStyle = UIModalTransitionStyle.crossDissolve
            self.navigationController?.present(nav, animated: true, completion: nil)
        })
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        self.checkShowSurroundingAddTooltip()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }



    // MARK: - Table view data source

    func numberOfSections(in tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return (form.ticket.property.surroundings as! [CUTESurrounding]).count
    }


    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {


        let cell = tableView.dequeueReusableCell(withIdentifier: "surroundingReuseIdentifier")

        var surroundingCell:CUTESurroundingCell

        if cell is CUTESurroundingCell {
            surroundingCell = cell as! CUTESurroundingCell
        }
        else {
            surroundingCell = CUTESurroundingCell(style: UITableViewCellStyle.default, reuseIdentifier: "surroundingReuseIdentifier")
            surroundingCell.typeButton.addTarget(self, action: #selector(CUTESurroundingListViewController.onTypeButtonPressed(_:)), for: UIControlEvents.touchUpInside)
            surroundingCell.durationButton.addTarget(self, action: #selector(CUTESurroundingListViewController.onDurationButtonPressed(_:)), for: UIControlEvents.touchUpInside)
            surroundingCell.removeButton.addTarget(self, action: #selector(CUTESurroundingListViewController.onRemoveButtonPressed(_:)), for: UIControlEvents.touchUpInside)
            surroundingCell.removeButton.hitTestEdgeInsets = UIEdgeInsetsMake(-10, -10, -10, -10)
        }
        let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
        let surrounding = surroundings[indexPath.row]
        surroundingCell.nameLabel.text = surrounding.name
        if let type = surrounding.type {
            if let image = type.image {
                if let url = URL(string: image) {
                    surroundingCell.typeImageView.setImageWith(url)
                }
            }
        }
        surroundingCell.typeButton.tag = indexPath.row
        surroundingCell.durationButton.tag = indexPath.row
        surroundingCell.removeButton.tag = indexPath.row


        var trafficTime = surrounding.trafficTimes?.filter({ (time:CUTETrafficTime) -> Bool in
            return time.isDefault
        }).first

        if trafficTime == nil {
            trafficTime = surrounding.trafficTimes?[0]
        }

        if trafficTime != nil {
            if let time = trafficTime?.time {
                let formattedTrafficTimePeriod = self.getFormattedMinuteTimePeriod(time)
                surroundingCell.durationButton.setTitle("\(formattedTrafficTimePeriod.value) " + (formattedTrafficTimePeriod.unitForDisplay), for: UIControlState())
            }

            if let type = trafficTime?.type {
                surroundingCell.typeButton.setTitle(type.value, for: UIControlState())
            }

            surroundingCell.setNeedsLayout()
        }

        return surroundingCell

    }

    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 80;
    }

    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
    }

    func searchAddSurrounding(_ surrounding: CUTESurrounding) {
        SVProgressHUD.show(withStatus: STR("SurroundingList/添加中..."))
        CUTEGeoManager.sharedInstance.searchSurroundingsTrafficInfoWithProperty(self.postcodeIndex, surroundings: [surrounding], country:self.form.ticket.property.country, cancellationToken: nil).continue({ (task:BFTask!) -> AnyObject! in
            if task.isCancelled {
                SVProgressHUD.showErrorWithCancellation()
            }
            else if task.error != nil {
                SVProgressHUD.showErrorWithError(task.error)
            }
//            else if task.exception != nil {
//                SVProgressHUD.showError(with: task.exception)
//            }
            else if let surroundings = task.result as? [CUTESurrounding] {
                if surroundings.count > 0 {
                    let completedSurrounding = surroundings[0]

                    self.form.syncTicket({ (ticket:CUTETicket?) -> Void in
                        var array = Array(ticket!.property.surroundings as! [CUTESurrounding])
                        array.insert(completedSurrounding, at: 0)
                        ticket!.property.surroundings = array

                    }).continue({ (task:BFTask!) -> AnyObject! in
                        self.tableView.reloadData()
                        if let surroundings = self.form.ticket.property.surroundings {
                            self.showHintLabel(surroundings.count == 0)
                        }
                        else {
                            self.showHintLabel(true)
                        }
                        SVProgressHUD.dismiss()
                        return task
                    })
                }
                else {
                    SVProgressHUD.showError(withStatus: STR("SurroundingList/添加失败，无法获取到该地点的交通信息"))
                }
            }
            else {
                SVProgressHUD.showError(withStatus: STR("SurroundingList/添加失败，无法获取到该地点的交通信息"))
            }
            return task
        })
    }

    func onTypeButtonPressed(_ sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {

            let modes = surr.trafficTimes!.map({ (time:CUTETrafficTime) -> String in
                if let timeValue = time.time {
                    let timePeriod = self.getFormattedMinuteTimePeriod(timeValue)
                    if let type = time.type {
                        return type.value + " \(timePeriod.value) " + timePeriod.unitForDisplay
                    }
                }
                return ""
            })

            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerated() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            ActionSheetStringPicker.show(withTitle: "", rows: modes, initialSelection: defaultTimeIndex, doneBlock: { (picker:ActionSheetStringPicker?, selectedIndex:Int, selectedValue:Any?) -> Void in

                for time in surr.trafficTimes! {
                    time.isDefault = false
                }
                let time = surr.trafficTimes![selectedIndex]
                time.isDefault = true
                self.tableView.reloadData()
                }, cancel: { (picker:ActionSheetStringPicker?) -> Void in
                    
                }, origin: sender)
        }
    }

    func onDurationButtonPressed(_ sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {
            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerated() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            let baseTime = self.getFormattedMinuteTimePeriod(surr.trafficTimes![defaultTimeIndex].time!)
            let baseTimeValue = baseTime.value
            let aroundValues = getAroundTime(baseTimeValue).map({ (intValue:Int32) -> String in
                return "\(intValue)"
            })
            let timetValueIndex = aroundValues.index(of: "\(baseTimeValue)")

            ActionSheetStringPicker.show(withTitle: "", rows: aroundValues, initialSelection:timetValueIndex!, doneBlock: { (picker:ActionSheetStringPicker?, selectedIndex:Int, selectedValue:Any?) -> Void in
                if let value = Int32(selectedValue as! String) {

                    SVProgressHUD.show()
                    self.form.syncTicket({ (ticket:CUTETicket?) -> Void in
                        if let surroundings = ticket!.property.surroundings {
                            let surr = (surroundings[sender.tag] as! CUTESurrounding)
                            var array = Array(surr.trafficTimes!)

                            let oldTrafficTime = array[defaultTimeIndex]
                            let time = CUTETimePeriod(value: value, unit: baseTime.unit!)
                            let newTrafficTime = CUTETrafficTime()
                            newTrafficTime!.type = oldTrafficTime.type
                            newTrafficTime!.isDefault = oldTrafficTime.isDefault
                            newTrafficTime!.time = time
                            array[defaultTimeIndex] = newTrafficTime!

                            //update traffic time just by assign a new array, because the listener listen the trafficTims attribute
                            surr.trafficTimes = array

                        }


                    }).continue({ (task:BFTask!) -> AnyObject! in
                        self.tableView.reloadData()
                        SVProgressHUD.dismiss()
                        return task
                    })
                }
                }, cancel: { (picker:ActionSheetStringPicker?) -> Void in
                    
                }, origin: sender)
        }

    }

    func onRemoveButtonPressed(_ sender:UIButton) {
        let index = sender.tag
        SVProgressHUD.show()
        self.form.syncTicket({ (ticket:CUTETicket?) -> Void in
            var array = Array(ticket!.property.surroundings as! [CUTESurrounding])
            array.remove(at: index)
            ticket!.property.surroundings = array
        }).continue({ (task:BFTask!) -> AnyObject! in
            self.tableView.reloadData()
            if let surroundings = self.form.ticket.property.surroundings {
                self.showHintLabel(surroundings.count == 0)
            }
            else {
                self.showHintLabel(true)
            }
            SVProgressHUD.dismiss()
            return task
        })
    }

    // MARK: - Private

    func showHintLabel(_ show:Bool) {
        if (show) {
            if self.hintLabel == nil {
                let label = UILabel()
                label.textColor = UIColor(hex6: 0x999999)
                label.textAlignment = NSTextAlignment.center
                label.numberOfLines = 0
                label.font = UIFont.systemFont(ofSize: 16)
                label.text = STR("SurroundingList/点击右上角“+”，添加周边的学校和地铁")
                self.tableView.backgroundView?.addSubview(label)
                label.frame = CGRect(x: 0, y: (self.view.frame.size.height - 40) / 2, width: label.superview!.bounds.size.width, height: 40)
                self.hintLabel = label
            }
        }

        self.hintLabel?.isHidden = !show
        self.tableView.backgroundView?.setNeedsLayout()
    }

    // MARK: - Util

    func getFormattedMinuteTimePeriod(_ timePeriod:CUTETimePeriod) -> CUTETimePeriod {

        if (timePeriod.unit == "second") {
            if (timePeriod.value < 60) {
                return CUTETimePeriod(value: 1, unit: "minute")
            }
            else {
                return CUTETimePeriod(value: timePeriod.value / 60, unit: "minute")
            }
        }
        else if (timePeriod.unit == "minute") {
            return timePeriod
        }
        else if (timePeriod.unit == "hour") {
            return CUTETimePeriod(value: timePeriod.value * 60, unit: "minute")
        }
        else if (timePeriod.unit == "day") {
            return CUTETimePeriod(value: timePeriod.value * 60 * 24, unit: "minute")
        }
        else if (timePeriod.unit == "week") {
            return CUTETimePeriod(value: timePeriod.value * 60 * 24 * 7, unit: "minute")
        }
        else if (timePeriod.unit == "month") {
            return CUTETimePeriod(value: timePeriod.value * 60 * 24 * 7 * 30, unit: "minute")
        }

        return timePeriod
    }


    func getAroundTime(_ timeValue:Int32) -> [Int32] {
        return [timeValue - 30,
            timeValue - 25,
            timeValue - 20,
            timeValue - 15,
            timeValue - 10,
            timeValue - 5,
            timeValue - 2,
            timeValue - 1,
            timeValue,
            timeValue + 1,
            timeValue + 2,
            timeValue + 5,
            timeValue + 10,
            timeValue + 15,
            timeValue + 20,
            timeValue + 25,
            timeValue + 30
            ].filter { (value:Int32) -> Bool in
            return value >= 0
        }
    }
}
